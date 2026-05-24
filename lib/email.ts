import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends a password reset email using Resend.
 * In development, if RESEND_API_KEY is not configured, it logs the reset link to the console.
 */
export async function sendResetPasswordEmail(email: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email}`);
  console.log(`[EMAIL DISPATCH] Link: ${resetLink}`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.log('[EMAIL] Resend API Key not found. Logged to console above for testing.');
    return { success: true, mocked: true, resetLink };
  }

  try {
    const data = await resend.emails.send({
      from: 'Devforge <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password - Devforge',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
          <h2 style="color: #3b82f6; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Devforge</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">You requested a password reset for your Devforge account. Click the button below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">Or copy and paste this link in your browser:</p>
          <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px; color: #374151; margin-bottom: 20px;">${resetLink}</p>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">This link is valid for 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return { success: false, error };
  }
}
