/**
 * Production: wire nodemailer or a provider (SendGrid, Resend).
 * For local dev, logs the link when SMTP is not configured.
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  const { SMTP_HOST, SMTP_USER } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    console.info(`[email stub] Password reset for ${to}: ${resetUrl}`);
    return;
  }
  console.info(`[email] Would send reset to ${to}: ${resetUrl}`);
}
