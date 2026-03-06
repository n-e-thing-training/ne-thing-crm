export async function sendEmail(recipient: string, subject: string, body: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP is not configured");
  }

  return {
    providerMessageId: `smtp-${Date.now()}`,
    response: {
      recipient,
      subject,
      accepted: true,
      bodyPreview: body.slice(0, 100)
    }
  };
}
