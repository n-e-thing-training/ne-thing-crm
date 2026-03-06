"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeEmail, normalizePhone } from "@/lib/utils";
import { writeAuditLog } from "@/lib/actions/audit";

const contactSchema = z.object({
  accountId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional()
});

export async function listContacts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, role, is_primary, created_at, accounts(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createContactAction(formData: FormData) {
  const parsed = contactSchema.parse({
    accountId: formData.get("accountId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    isPrimary: formData.get("isPrimary") === "on",
    notes: formData.get("notes")
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (parsed.isPrimary) {
    await supabase.from("contacts").update({ is_primary: false }).eq("account_id", parsed.accountId);
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      account_id: parsed.accountId,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      role: parsed.role || null,
      is_primary: parsed.isPrimary,
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "contact",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/contacts");
  revalidatePath("/accounts");
}
