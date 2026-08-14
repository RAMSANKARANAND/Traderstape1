/**
 * Resend email sending helper for password reset emails.
 *
 * Uses the Resend API (https://resend.com) to send transactional emails.
 * API key is read from the Cloudflare environment variable RESEND_API_KEY.
 */

export async function sendPasswordResetEmail(
  env: { RESEND_API_KEY: string },
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Traderstape <noreply@traderstape.com>",
      to,
      subject: "Reset your Traderstape password",
      html: `
        <div style="font-family: system-ui, -apple-font, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
            Reset your password
          </h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            You're receiving this email because a password reset was requested for your Traderstape account.
          </p>
          <div style="margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #c65315; color: #fff; padding: 12px 24px; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #999; font-size: 13px; line-height: 1.6;">
            If you didn't request this reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown");
    return { success: false, error: `Resend API error: ${response.status}` };
  }

  const data = await response.json();
  return { success: true };
}