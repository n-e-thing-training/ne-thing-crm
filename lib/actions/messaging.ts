"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { messageBatchSchema } from "@/lib/actions/schemas";
import { renderTemplate } from "@/lib/messaging/templates";
import { writeAuditLog } from "@/lib/actions/audit";
import { sendSms } from "@/lib/integrations/twilio";
import { sendEmail } from "@/lib/integrations/email";

export async function listMessageBatches() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("message_batches")
    .select("id, class_id, channel, status, approved_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listMessagingOptions() {
  const supabase = await createServerSupabaseClient();

  const [classesRes, templatesRes] = await Promise.all([
    supabase
      .from("classes")
      .select("id, class_date, city, state")
      .in("status", ["scheduled", "ready"]) 
      .order("class_date", { ascending: true })
      .limit(200),
    supabase
      .from("message_templates")
      .select("id, name, type")
      .eq("active", true)
      .order("name", { ascending: true })
  ]);

  if (classesRes.error) throw new Error(classesRes.error.message);
  if (templatesRes.error) throw new Error(templatesRes.error.message);

  return {
    classes: classesRes.data ?? [],
    templates: templatesRes.data ?? []
  };
}

export async function createMessageBatchAction(formData: FormData) {
  const parsed = messageBatchSchema.parse({
    classId: formData.get("classId"),
    channel: formData.get("channel"),
    templateId: formData.get("templateId") || undefined,
    idempotencyKey: formData.get("idempotencyKey") || randomUUID()
  });

  const customSubject = String(formData.get("subject") || "").trim();
  const customBody = String(formData.get("body") || "").trim();

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const classRes = await supabase
    .from("classes")
    .select("id, class_date, start_time, instructor, street, city, state, zip, course_id")
    .eq("id", parsed.classId)
    .single();

  if (classRes.error) throw new Error(classRes.error.message);

  let templateBody = customBody;
  let templateSubject: string | null = customSubject || null;

  if (parsed.templateId) {
    const templateRes = await supabase
      .from("message_templates")
      .select("subject, body, type")
      .eq("id", parsed.templateId)
      .single();

    if (templateRes.error) throw new Error(templateRes.error.message);
    if (templateRes.data.type !== parsed.channel) {
      throw new Error("Template type does not match selected channel");
    }

    templateBody = templateRes.data.body;
    templateSubject = templateRes.data.subject;
  }

  if (!templateBody) throw new Error("Message body is required");

  const registrationRes = await supabase
    .from("registrations")
    .select("id, participants(first_name, email, phone)")
    .eq("class_id", parsed.classId)
    .in("readiness_status", ["ready", "warning"]);

  if (registrationRes.error) throw new Error(registrationRes.error.message);

  const { data: batch, error: batchError } = await supabase
    .from("message_batches")
    .insert({
      class_id: parsed.classId,
      channel: parsed.channel,
      template_id: parsed.templateId ?? null,
      status: "draft",
      send_idempotency_key: parsed.idempotencyKey,
      created_by: userData.user?.id
    })
    .select("id")
    .single();

  if (batchError) throw new Error(batchError.message);

  const classLocation = [classRes.data.street, classRes.data.city, classRes.data.state, classRes.data.zip]
    .filter(Boolean)
    .join(", ");

  const queueRows = (registrationRes.data ?? [])
    .map((registration) => {
      const participant = Array.isArray(registration.participants)
        ? registration.participants[0]
        : registration.participants;
      if (!participant) return null;

      const recipient = parsed.channel === "sms" ? participant.phone : participant.email;
      if (!recipient) return null;

      const rendered = renderTemplate({
        body: templateBody,
        subject: templateSubject,
        participantFirstName: participant.first_name,
        classDate: classRes.data.class_date,
        classTime: classRes.data.start_time,
        classLocation: classLocation || "TBD",
        instructorName: classRes.data.instructor
      });

      return {
        batch_id: batch.id,
        registration_id: registration.id,
        recipient,
        rendered_subject: rendered.renderedSubject,
        rendered_body: rendered.renderedBody
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (queueRows.length === 0) {
    throw new Error("No eligible recipients found for this class and channel");
  }

  const queueInsert = await supabase.from("message_queue").insert(queueRows);
  if (queueInsert.error) throw new Error(queueInsert.error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "message_batch",
    entityId: batch.id,
    action: "create_draft",
    changeSet: {
      classId: parsed.classId,
      channel: parsed.channel,
      templateId: parsed.templateId,
      queueSize: queueRows.length
    }
  });

  revalidatePath("/messaging");
  revalidatePath("/dashboard");
}

export async function approveMessageBatchAction(formData: FormData) {
  const batchId = String(formData.get("batchId") || "");
  if (!batchId) throw new Error("batchId is required");

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const update = await supabase
    .from("message_batches")
    .update({
      status: "approved",
      approved_by: userData.user?.id,
      approved_at: new Date().toISOString()
    })
    .eq("id", batchId)
    .eq("status", "draft")
    .select("id")
    .single();

  if (update.error) throw new Error(update.error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "message_batch",
    entityId: batchId,
    action: "approve",
    changeSet: {
      approvedAt: new Date().toISOString()
    }
  });

  revalidatePath("/messaging");
  revalidatePath("/dashboard");
}

export async function sendApprovedBatch(batchId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: batch, error: batchError } = await supabase
    .from("message_batches")
    .select("id, status, channel")
    .eq("id", batchId)
    .single();

  if (batchError) throw new Error(batchError.message);
  if (batch.status !== "approved") throw new Error("Batch must be approved before send");

  const moveToSending = await supabase
    .from("message_batches")
    .update({ status: "sending" })
    .eq("id", batchId)
    .eq("status", "approved");

  if (moveToSending.error) throw new Error(moveToSending.error.message);

  const queueRes = await supabase
    .from("message_queue")
    .select("id, registration_id, recipient, rendered_subject, rendered_body, status")
    .eq("batch_id", batchId)
    .eq("status", "queued");

  if (queueRes.error) throw new Error(queueRes.error.message);

  let failures = 0;

  for (const message of queueRes.data ?? []) {
    try {
      const result =
        batch.channel === "sms"
          ? await sendSms(message.recipient, message.rendered_body)
          : await sendEmail(message.recipient, message.rendered_subject ?? "Training Reminder", message.rendered_body);

      await supabase
        .from("message_queue")
        .update({
          status: "sent",
          provider_message_id: result.providerMessageId,
          sent_at: new Date().toISOString(),
          error_message: null
        })
        .eq("id", message.id);

      await supabase.from("communication_history").insert({
        queue_id: message.id,
        registration_id: message.registration_id,
        recipient: message.recipient,
        channel: batch.channel,
        message_body: message.rendered_body,
        provider_response: result.response,
        delivery_status: "sent"
      });

      await supabase.from("registrations").update({
        send_status: "sent",
        ...(batch.channel === "sms"
          ? { last_sms_sent: new Date().toISOString() }
          : { last_email_sent: new Date().toISOString() })
      }).eq("id", message.registration_id);
    } catch (error) {
      failures += 1;
      await supabase
        .from("message_queue")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown send error"
        })
        .eq("id", message.id);

      await supabase.from("communication_history").insert({
        queue_id: message.id,
        registration_id: message.registration_id,
        recipient: message.recipient,
        channel: batch.channel,
        message_body: message.rendered_body,
        provider_response: { error: error instanceof Error ? error.message : "Unknown send error" },
        delivery_status: "failed"
      });
    }
  }

  await supabase
    .from("message_batches")
    .update({ status: failures > 0 ? "failed" : "sent" })
    .eq("id", batchId);

  revalidatePath("/messaging");
  revalidatePath("/dashboard");
}

export async function sendBatchNowAction(formData: FormData) {
  const batchId = String(formData.get("batchId") || "");
  if (!batchId) throw new Error("batchId is required");
  await sendApprovedBatch(batchId);
}
