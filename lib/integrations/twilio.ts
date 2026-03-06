import { optionalEnv } from "@/lib/env";

export async function sendSms(recipient: string, message: string) {
  const sid = optionalEnv("TWILIO_SID");
  const authToken = optionalEnv("TWILIO_AUTH_TOKEN");
  const fromNumber = optionalEnv("TWILIO_FROM_NUMBER");

  if (!sid || !authToken || !fromNumber) {
    throw new Error("Twilio is not configured");
  }

  const credentials = Buffer.from(`${sid}:${authToken}`).toString("base64");
  const body = new URLSearchParams({
    To: recipient,
    From: fromNumber,
    Body: message
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Twilio send failed");
  }

  return {
    providerMessageId: payload.sid as string,
    response: payload
  };
}
