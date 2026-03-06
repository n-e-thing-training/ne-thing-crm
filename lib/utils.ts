export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.startsWith("+")) return digits;
  return `+${digits}`;
}

export function normalizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function fullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
