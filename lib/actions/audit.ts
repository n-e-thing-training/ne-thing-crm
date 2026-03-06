import { createServerSupabaseClient } from "@/lib/supabase/server";

interface AuditPayload {
  actorId?: string | null;
  actorEmail?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  changeSet?: Record<string, unknown>;
}

export async function writeAuditLog(payload: AuditPayload) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("audit_logs").insert({
    actor_id: payload.actorId,
    actor_email: payload.actorEmail,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    action: payload.action,
    change_set: payload.changeSet ?? {}
  });
}
