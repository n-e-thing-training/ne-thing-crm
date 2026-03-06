"use server";

import { revalidatePath } from "next/cache";
import { registrationSchema } from "@/lib/actions/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { evaluateReadiness } from "@/lib/readiness/evaluate";
import { writeAuditLog } from "@/lib/actions/audit";

export async function listRegistrations() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, payment_status, waiver_status, online_status, readiness_status, send_status, classes(id, class_date, city, state), participants(id, first_name, last_name, email, phone)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listRegistrationOptions() {
  const supabase = await createServerSupabaseClient();

  const [classesRes, participantsRes] = await Promise.all([
    supabase.from("classes").select("id, class_date, city, state").order("class_date", { ascending: false }).limit(200),
    supabase
      .from("participants")
      .select("id, first_name, last_name")
      .order("last_name", { ascending: true })
      .limit(1000)
  ]);

  if (classesRes.error) throw new Error(classesRes.error.message);
  if (participantsRes.error) throw new Error(participantsRes.error.message);

  return {
    classes: classesRes.data ?? [],
    participants: participantsRes.data ?? []
  };
}

export async function createRegistrationAction(formData: FormData) {
  const parsed = registrationSchema.parse({
    classId: formData.get("classId"),
    participantId: formData.get("participantId"),
    paymentStatus: formData.get("paymentStatus"),
    waiverStatus: formData.get("waiverStatus"),
    onlineStatus: formData.get("onlineStatus"),
    notes: formData.get("notes")
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const [classRes, participantRes] = await Promise.all([
    supabase.from("classes").select("class_date, street, city, state, zip").eq("id", parsed.classId).single(),
    supabase.from("participants").select("email, phone").eq("id", parsed.participantId).single()
  ]);

  if (classRes.error) throw new Error(classRes.error.message);
  if (participantRes.error) throw new Error(participantRes.error.message);

  const readiness = evaluateReadiness({
    classDate: classRes.data.class_date,
    street: classRes.data.street,
    city: classRes.data.city,
    state: classRes.data.state,
    zip: classRes.data.zip,
    email: participantRes.data.email,
    phone: participantRes.data.phone,
    paymentStatus: parsed.paymentStatus,
    waiverStatus: parsed.waiverStatus,
    onlineStatus: parsed.onlineStatus
  });

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      class_id: parsed.classId,
      participant_id: parsed.participantId,
      payment_status: parsed.paymentStatus,
      waiver_status: parsed.waiverStatus,
      online_status: parsed.onlineStatus,
      readiness_status: readiness.readinessStatus,
      readiness_errors: readiness.readinessErrors,
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "registration",
    entityId: data.id,
    action: "create",
    changeSet: { ...parsed, ...readiness }
  });

  revalidatePath("/registrations");
  revalidatePath("/dashboard");
}
