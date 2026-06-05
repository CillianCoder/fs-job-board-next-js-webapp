import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const resendFromName = process.env.EMAIL_FROM_NAME || "Devforge";
const resendFromText = `${resendFromName} <${resendFromEmail}>`;

async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const testRecipient = process.env.RESEND_TEST_RECIPIENT;
  const useTestRecipient =
    testRecipient && process.env.NODE_ENV !== "production";
  const sendTo = useTestRecipient ? testRecipient : options.to;

  console.log(
    `[EMAIL] sendEmail mode: resendConfigured=${!!resend}, testRecipient=${
      testRecipient ?? "<none>"
    }, useTestRecipient=${useTestRecipient}, sendTo=${sendTo}`,
  );

  if (testRecipient && useTestRecipient && testRecipient !== options.to) {
    console.warn(
      `[EMAIL] Redirecting outgoing email from ${options.to} to ${testRecipient} because RESEND_TEST_RECIPIENT is set in non-production environment.`,
    );
  }

  if (testRecipient && !useTestRecipient && testRecipient !== options.to) {
    console.warn(
      `[EMAIL] Ignoring RESEND_TEST_RECIPIENT in production and sending email to ${options.to}.`,
    );
  }

  if (!resend) {
    console.log(`\n[EMAIL MOCK] To: ${sendTo}`);
    console.log(`[EMAIL MOCK] Subject: ${options.subject}`);
    console.log(options.html);
    console.log(`\n`);
    return {
      success: true,
      mocked: true,
      resendConfigured: false,
      redirectedToTestRecipient: !!useTestRecipient,
      originalTo: options.to,
      sendTo,
      from: resendFromText,
    };
  }

  try {
    const data = await resend.emails.send({
      from: resendFromText,
      to: sendTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return {
      success: true,
      data,
      resendConfigured: true,
      redirectedToTestRecipient: !!useTestRecipient,
      originalTo: options.to,
      sendTo,
      from: resendFromText,
    };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return {
      success: false,
      error,
      resendConfigured: true,
      originalTo: options.to,
    };
  }
}

/**
 * Sends a password reset email using Resend.
 * In development, if RESEND_API_KEY is not configured, it logs the reset link to the console.
 */
export async function sendResetPasswordEmail(email: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetLink = `${siteUrl}/reset-password?token=${token}`;

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email}`);
  console.log(`[EMAIL DISPATCH] Link: ${resetLink}`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.log(
      "[EMAIL] Resend API Key not found. Logged to console above for testing.",
    );
    return {
      success: true,
      mocked: true,
      resendConfigured: false,
      resetLink,
      originalTo: email,
    };
  }

  return await sendEmail({
    to: email,
    subject: "Reset your password - Devforge",
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
}

function formatInterviewDateTime(dateTime?: string | null) {
  if (!dateTime) return null;

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function sendInterviewInvitationEmail(options: {
  email: string;
  name: string;
  jobTitle: string;
  company: string;
  interviewDate?: string | null;
  videoLink?: string | null;
  notes?: string | null;
}) {
  const { email, name, jobTitle, company, interviewDate, videoLink, notes } =
    options;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const formattedDate = formatInterviewDateTime(interviewDate);

  const intro = `Hi ${name},`;
  const interviewDetails = formattedDate
    ? `<p style="margin-bottom: 16px;"><strong>Interview date & time:</strong> ${formattedDate}</p>`
    : "";
  const videoDetails = videoLink
    ? `<p style="margin-bottom: 16px;"><strong>Video conference link:</strong> <a href="${videoLink}" style="color: #2563eb; text-decoration: none;">${videoLink}</a></p>`
    : "";
  const notesSection = notes
    ? `<p style="margin-bottom: 16px;"><strong>Recruiter / admin note:</strong><br />${notes.replace(/\n/g, "<br />")}</p>`
    : "";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <h2 style="color: #3b82f6; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Interview Invitation</h2>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">${intro}</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Great news — you have been selected for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
      ${interviewDetails}
      ${videoDetails}
      ${notesSection}
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you have any questions, please reply to this email.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">If the interview date or link is missing, your recruiter will reach out with the details shortly.</p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin-top: 20px;">Sent from <a href="${siteUrl}" style="color: #3b82f6; text-decoration: none;">Devforge</a>.</p>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email}`);
  console.log(`[EMAIL DISPATCH] Subject: Interview Invitation for ${jobTitle}`);
  console.log(`[EMAIL DISPATCH] Date: ${formattedDate || "(not provided)"}`);
  console.log(`[EMAIL DISPATCH] Link: ${videoLink || "(not provided)"}`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.log(
      "[EMAIL] Resend API Key not found. Logged interview invite details above for testing.",
    );
    return { success: true, mocked: true };
  }

  return await sendEmail({
    to: email,
    subject: `Interview Invitation: ${jobTitle} at ${company}`,
    html,
  });
}

/**
 * Format a cautious user-facing message based on email delivery flags.
 */
export function formatDeliveryWarning(
  originalTo: string,
  emailResult: any,
  purpose = "notification",
) {
  const mocked = !!emailResult.mocked;
  const redirected = !!emailResult.redirectedToTestRecipient;
  const resendConfigured = !!emailResult.resendConfigured;

  if (mocked || redirected || !resendConfigured) {
    const to = originalTo || emailResult.originalTo || "the recipient";
    return `We attempted to send ${purpose} to ${to}, but delivery may be limited. Check your spam folder, or contact the site administrator if you do not receive the email.`;
  }

  return `We attempted to send ${purpose} to ${originalTo}. If you don't receive it within a few minutes, check your spam or junk folder.`;
}
