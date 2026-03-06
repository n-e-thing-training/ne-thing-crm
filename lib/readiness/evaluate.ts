import { ReadinessStatus } from "@/types/domain";

interface EvaluateReadinessInput {
  classDate?: string | null;
  city?: string | null;
  street?: string | null;
  state?: string | null;
  zip?: string | null;
  email?: string | null;
  phone?: string | null;
  paymentStatus: "unpaid" | "paid" | "unknown";
  waiverStatus: "missing" | "complete";
  onlineStatus: "not_started" | "complete";
}

export function evaluateReadiness(input: EvaluateReadinessInput): {
  readinessStatus: ReadinessStatus;
  readinessErrors: string[];
} {
  const errors: string[] = [];

  if (!input.classDate) errors.push("Missing class date");
  if (!input.street || !input.city || !input.state || !input.zip) {
    errors.push("Missing class location");
  }

  const hasContact = Boolean(input.email || input.phone);
  if (!hasContact) errors.push("Missing participant contact");

  if (input.phone && !/^\+\d{10,15}$/.test(input.phone)) {
    errors.push("Invalid phone number");
  }

  if (input.paymentStatus === "unpaid") {
    errors.push("Payment not completed");
  }

  if (input.waiverStatus === "missing") {
    errors.push("Waiver missing");
  }

  if (input.onlineStatus === "not_started") {
    errors.push("Online module incomplete");
  }

  if (errors.length === 0) {
    return { readinessStatus: "ready", readinessErrors: [] };
  }

  const blocking = errors.some((error) =>
    ["Missing class date", "Missing class location", "Missing participant contact", "Invalid phone number"].includes(error)
  );

  return {
    readinessStatus: blocking ? "blocked" : "warning",
    readinessErrors: errors
  };
}
