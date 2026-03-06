"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/actions/audit";

const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().optional()
});

export async function listCourses() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code, duration_minutes, created_at")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCourseAction(formData: FormData) {
  const parsed = courseSchema.parse({
    name: formData.get("name"),
    code: formData.get("code"),
    durationMinutes: formData.get("durationMinutes") || undefined
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("courses")
    .insert({
      name: parsed.name,
      code: parsed.code || null,
      duration_minutes: parsed.durationMinutes ?? null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "course",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/courses");
  revalidatePath("/classes");
}
