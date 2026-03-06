"use server";

import { revalidatePath } from "next/cache";
import { accountSchema } from "@/lib/actions/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeEmail, normalizePhone } from "@/lib/utils";
import { writeAuditLog } from "@/lib/actions/audit";

export async function listAccounts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, organization_type, billing_email, billing_phone, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAccountAction(formData: FormData) {
  const parsed = accountSchema.parse({
    name: formData.get("name"),
    organizationType: formData.get("organizationType"),
    billingEmail: formData.get("billingEmail"),
    billingPhone: formData.get("billingPhone"),
    address: formData.get("address"),
    notes: formData.get("notes")
  });

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: parsed.name,
      organization_type: parsed.organizationType || null,
      billing_email: normalizeEmail(parsed.billingEmail),
      billing_phone: normalizePhone(parsed.billingPhone),
      address: parsed.address || null,
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "account",
    entityId: data.id,
    action: "create",
    changeSet: parsed
  });

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
