"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listCommunicationHistory() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("communication_history")
    .select("id, recipient, channel, message_body, delivery_status, timestamp")
    .order("timestamp", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAuditLogs() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, actor_email, entity_type, entity_id, action, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}
