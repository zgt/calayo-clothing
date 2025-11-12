import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";
import { env } from "~/env";

// Initialize Resend with API key
const resend = new Resend(env.RESEND_API_KEY);

// Email sending configuration
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend service
 */
export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: "Calayo Clothing <noreply@mattcalayo.com>",
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV === "development") {
      console.warn(`✅ Email sent successfully to: ${to}`);
      console.warn(`📧 Subject: ${subject}`);
      console.warn(`📧 Resend ID: ${result.data?.id}`);
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error);

    // In development, log the email content for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("📧 Email that failed to send:");
      console.error(`To: ${to}`);
      console.error(`Subject: ${subject}`);
      console.error("HTML preview:", html.substring(0, 200) + "...");
    }

    throw error;
  }
}

// Load and process email templates
function loadTemplate(templateName: string): string {
  const templatePath = join(process.cwd(), "emails", templateName);
  return readFileSync(templatePath, "utf-8");
}

// Template processing utility
function processTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  let processed = template;

  // Replace Supabase-style variables with provided values
  Object.entries(variables).forEach(([key, value]) => {
    // Handle both {{ .Key }} and {{ .key }} formats
    const patterns = [
      new RegExp(`\\{\\{\\s*\\.${key}\\s*\\}\\}`, "g"),
      new RegExp(
        `\\{\\{\\s*\\.${key.charAt(0).toUpperCase() + key.slice(1)}\\s*\\}\\}`,
        "g",
      ),
    ];

    patterns.forEach((pattern) => {
      processed = processed.replace(pattern, value);
    });
  });

  return processed;
}

// Better Auth email functions

/**
 * Send email verification email (signup confirmation)
 */
export async function sendVerificationEmail({
  user,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  url: string;
  token: string;
}): Promise<void> {
  const template = loadTemplate("confirm-signup.html");
  const html = processTemplate(template, {
    confirmationURL: url,
    email: user.email,
    name: user.name ?? "there",
  });

  await sendEmail({
    to: user.email,
    subject: "Welcome to Calayo Clothing - Confirm Your Account",
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  user,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  url: string;
  token: string;
}): Promise<void> {
  const template = loadTemplate("reset-password.html");
  const html = processTemplate(template, {
    confirmationURL: url,
    email: user.email,
    name: user.name ?? "there",
  });

  await sendEmail({
    to: user.email,
    subject: "Reset Your Password - Calayo Clothing",
    html,
  });
}

/**
 * Send email change verification email
 */
export async function sendChangeEmailVerificationEmail({
  user,
  newEmail,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  newEmail: string;
  url: string;
  token: string;
}): Promise<void> {
  const template = loadTemplate("change-email.html");
  const html = processTemplate(template, {
    confirmationURL: url,
    email: newEmail, // Show the NEW email address in the template
    currentEmail: user.email,
    name: user.name ?? "there",
  });

  // Send to current email for security (user must approve the change)
  await sendEmail({
    to: user.email,
    subject: "Confirm Email Change - Calayo Clothing",
    html,
  });
}

/**
 * Send magic link email (passwordless authentication)
 */
export async function sendMagicLinkEmail({
  email,
  url,
  token: _token,
}: {
  email: string;
  url: string;
  token: string;
}): Promise<void> {
  const template = loadTemplate("magic-link.html");
  const html = processTemplate(template, {
    confirmationURL: url,
    email,
  });

  await sendEmail({
    to: email,
    subject: "Your Magic Link - Calayo Clothing",
    html,
  });
}

/**
 * Send invitation email (for admin user invitations)
 */
export async function sendInvitationEmail({
  email,
  inviterName,
  inviterEmail,
  organizationName,
  url,
}: {
  email: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  url: string;
}): Promise<void> {
  const template = loadTemplate("invite-user.html");
  const html = processTemplate(template, {
    confirmationURL: url,
    email,
    inviterName,
    inviterEmail,
    organizationName: organizationName ?? "Calayo Clothing",
  });

  await sendEmail({
    to: email,
    subject: `You're Invited to ${organizationName || "Calayo Clothing"}`,
    html,
  });
}

/**
 * Send reauthentication token email (2FA/verification code)
 */
export async function sendReauthenticationEmail({
  user,
  token: _token,
}: {
  user: { email: string; name?: string };
  token: string;
}): Promise<void> {
  const template = loadTemplate("reauthentication.html");
  const html = processTemplate(template, {
    token: _token,
    email: user.email,
    name: user.name ?? "there",
  });

  await sendEmail({
    to: user.email,
    subject: "Confirm Your Identity - Calayo Clothing",
    html,
  });
}

/**
 * Send OTP email (for email OTP plugin)
 */
export async function sendOTPEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}): Promise<void> {
  // Use reauthentication template for OTP codes
  const template = loadTemplate("reauthentication.html");

  let subject = "Your Verification Code - Calayo Clothing";
  if (type === "sign-in") subject = "Your Sign-In Code - Calayo Clothing";
  if (type === "forget-password")
    subject = "Your Password Reset Code - Calayo Clothing";

  const html = processTemplate(template, {
    token: otp,
    email,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
