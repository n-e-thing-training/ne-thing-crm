"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardSummary } from "@/types/domain";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createServerSupabaseClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    upcomingClasses,
    blockedRegistrations,
    missingWaivers,
    unpaidParticipants,
    pendingReminderBatches,
    messageFailures
  ] = await Promise.all([
    supabase.from("classes").select("id", { count: "exact", head: true }).gte("class_date", today),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("readiness_status", "blocked"),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("waiver_status", "missing"),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("payment_status", "unpaid"),
    supabase.from("message_batches").select("id", { count: "exact", head: true }).in("status", ["draft", "approved"]),
    supabase.from("message_queue").select("id", { count: "exact", head: true }).eq("status", "failed")
  ]);

  return {
    upcomingClasses: upcomingClasses.count ?? 0,
    blockedRegistrations: blockedRegistrations.count ?? 0,
    missingWaivers: missingWaivers.count ?? 0,
    unpaidParticipants: unpaidParticipants.count ?? 0,
    pendingReminderBatches: pendingReminderBatches.count ?? 0,
    messageFailures: messageFailures.count ?? 0
  };
}
