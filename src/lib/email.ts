import nodemailer from "nodemailer";
import { SITE, siteUrl } from "@/lib/site";

interface MailOptions {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

function emailConfigured(): boolean {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

/**
 * Sends a notification email to the shop inbox. When SMTP credentials are not
 * configured (e.g. local demo), the email is logged to the console instead of
 * failing — notifications must never break a booking.
 */
export async function sendAdminEmail({ subject, html, text, replyTo }: MailOptions): Promise<void> {
  const to = process.env.EMAIL_RECEIVER ?? process.env.EMAIL_USER;

  if (!emailConfigured() || !to) {
    console.warn(
      `[email] SMTP not configured — skipping send.\n  Subject: ${subject}\n  ${text.trim().split("\n").join("\n  ")}`
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${SITE.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
      replyTo,
    });
  } catch (error) {
    // Log and continue: a failed notification should never fail the request.
    console.error("[email] Failed to send notification:", error);
  }
}

/** Renders the shared notification layout: a heading, key/value rows, and an admin link. */
export function renderAdminEmail(
  title: string,
  rows: Array<[label: string, value: string]>,
  adminPath = "/admin"
): { html: string; text: string } {
  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#334155;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
    <h1 style="font-size:18px;color:#0f172a;border-bottom:2px solid #0d9488;padding-bottom:12px;">${title}</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${tableRows}</table>
    <a href="${siteUrl()}${adminPath}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600;">Open admin dashboard</a>
    <p style="margin-top:24px;font-size:12px;color:#64748b;">${SITE.name} — automated notification</p>
  </div>`;

  const text = `${title}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nAdmin: ${siteUrl()}${adminPath}`;

  return { html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
