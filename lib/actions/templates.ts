"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/actions/audit";

const templateSchema = z.object({
  type: z.enum(["sms", "email"]),
  courseId: z.string().uuid().optional(),
  name: z.string().min(2),
  subject: z.string().optional(),
  body: z.string().min(5),
  active: z.boolean().default(true)
});

export async function listMessageTemplates() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("message_templates")
    .select("id, name, type, subject, body, active, courses(name), created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMessageTemplateAction(formData: FormData) {
  const parsed = templateSchema.parse({
    type: formData.get("type"),
    courseId: formData.get("courseId") || undefined,
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    active: formData.get("active") !== "off"
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      type: parsed.type,
      course_id: parsed.courseId || null,
      name: parsed.name,
      subject: parsed.subject || null,
      body: parsed.body,
      active: parsed.active
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "message_template",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/templates");
  revalidatePath("/messaging");
}
