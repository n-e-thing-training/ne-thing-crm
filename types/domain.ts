export type ClassStatus = "draft" | "scheduled" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "unknown";
export type WaiverStatus = "missing" | "complete";
export type OnlineStatus = "not_started" | "complete";
export type ReadinessStatus = "ready" | "blocked" | "warning";
export type MessageChannel = "sms" | "email";
export type MessageBatchStatus = "draft" | "approved" | "sending" | "sent" | "failed";
export type MessageQueueStatus = "queued" | "sent" | "failed" | "skipped";

export interface DashboardSummary {
  upcomingClasses: number;
  blockedRegistrations: number;
  missingWaivers: number;
  unpaidParticipants: number;
  pendingReminderBatches: number;
  messageFailures: number;
}
