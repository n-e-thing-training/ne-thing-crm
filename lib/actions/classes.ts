"use server";

import { revalidatePath } from "next/cache";
import { classSchema } from "@/lib/actions/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/actions/audit";

export async function listClasses() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, class_date, start_time, end_time, instructor, city, state, status, accounts(name), courses(name)"
    )
    .order("class_date", { ascending: true })
    .limit(150);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAccountAndCourseOptions() {
  const supabase = await createServerSupabaseClient();

  const [accountsRes, coursesRes] = await Promise.all([
    supabase.from("accounts").select("id, name").order("name", { ascending: true }),
    supabase.from("courses").select("id, name").order("name", { ascending: true })
  ]);

  if (accountsRes.error) throw new Error(accountsRes.error.message);
  if (coursesRes.error) throw new Error(coursesRes.error.message);

  return {
    accounts: accountsRes.data ?? [],
    courses: coursesRes.data ?? []
  };
}

export async function createClassAction(formData: FormData) {
  const parsed = classSchema.parse({
    accountId: formData.get("accountId"),
    courseId: formData.get("courseId"),
    classDate: formData.get("classDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    instructor: formData.get("instructor"),
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    status: formData.get("status"),
    notes: formData.get("notes")
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      account_id: parsed.accountId,
      course_id: parsed.courseId,
      class_date: parsed.classDate || null,
      start_time: parsed.startTime || null,
      end_time: parsed.endTime || null,
      instructor: parsed.instructor || null,
      street: parsed.street || null,
      city: parsed.city || null,
      state: parsed.state || null,
      zip: parsed.zip || null,
      status: parsed.status,
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "class",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/classes");
  revalidatePath("/dashboard");
}
