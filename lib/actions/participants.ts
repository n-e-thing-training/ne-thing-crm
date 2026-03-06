"use server";

import { revalidatePath } from "next/cache";
import { participantSchema } from "@/lib/actions/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeEmail, normalizePhone } from "@/lib/utils";
import { writeAuditLog } from "@/lib/actions/audit";

export async function listParticipants() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id, first_name, last_name, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createParticipantAction(formData: FormData) {
  const parsed = participantSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    certificationFirstName: formData.get("certificationFirstName"),
    certificationLastName: formData.get("certificationLastName"),
    certificationEmail: formData.get("certificationEmail"),
    certificationPhone: formData.get("certificationPhone"),
    notes: formData.get("notes")
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("participants")
    .insert({
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      certification_first_name: parsed.certificationFirstName || null,
      certification_last_name: parsed.certificationLastName || null,
      certification_email: normalizeEmail(parsed.certificationEmail),
      certification_phone: normalizePhone(parsed.certificationPhone),
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "participant",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/participants");
  revalidatePath("/dashboard");
}
