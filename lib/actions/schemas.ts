import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2),
  organizationType: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal("")),
  billingPhone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

export const classSchema = z.object({
  accountId: z.string().uuid(),
  courseId: z.string().uuid(),
  classDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  instructor: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  status: z.enum(["draft", "scheduled", "ready", "completed", "cancelled"]).default("draft"),
  notes: z.string().optional()
});

export const participantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  certificationFirstName: z.string().optional(),
  certificationLastName: z.string().optional(),
  certificationEmail: z.string().email().optional().or(z.literal("")),
  certificationPhone: z.string().optional(),
  notes: z.string().optional()
});

export const registrationSchema = z.object({
  classId: z.string().uuid(),
  participantId: z.string().uuid(),
  paymentStatus: z.enum(["unpaid", "paid", "unknown"]).default("unknown"),
  waiverStatus: z.enum(["missing", "complete"]).default("missing"),
  onlineStatus: z.enum(["not_started", "complete"]).default("not_started"),
  notes: z.string().optional()
});

export const messageBatchSchema = z.object({
  classId: z.string().uuid(),
  channel: z.enum(["sms", "email"]),
  templateId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8)
});

export const templateRenderVarsSchema = z.object({
  participant_first_name: z.string().default(""),
  class_date: z.string().default(""),
  class_time: z.string().default(""),
  class_location: z.string().default(""),
  instructor_name: z.string().default("")
});
