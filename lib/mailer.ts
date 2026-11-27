import nodemailer from 'nodemailer';

/**
 * Google SMTP transport.
 *
 * Gmail requires an App Password (Google Account → Security → 2-Step
 * Verification → App passwords). Your normal Google password will NOT work.
 *
 *   SMTP_HOST   defaults to smtp.gmail.com
 *   SMTP_PORT   defaults to 465 (SSL). Use 587 for STARTTLS.
 *   SMTP_USER   the full Gmail address
 *   SMTP_PASS   the 16-character app password
 *   MAIL_FROM   optional display sender, e.g. "Hirun Hansaka <you@gmail.com>"
 */

let cached: nodemailer.Transporter | null = null;

export function hasMailEnv(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function mailer() {
  if (!hasMailEnv()) {
    throw new Error(
      'Email is not configured. Add SMTP_USER and SMTP_PASS (Google App Password) to your environment.'
    );
  }
  if (cached) return cached;

  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

export function fromAddress() {
  return process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost';
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Minimal responsive email shell in the site's palette. */
export function replyHtml({
  body,
  ownerName,
  siteUrl,
  originalMessage,
}: {
  body: string;
  ownerName: string;
  siteUrl: string;
  originalMessage?: string;
}) {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const quoted = originalMessage
    ? `<div style="margin-top:28px;padding-top:18px;border-top:1px solid #e6e4df;">
         <p style="margin:0 0 6px;font-family:monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a86;">Your message</p>
         <p style="margin:0;color:#6b6b68;font-size:13px;line-height:1.6;white-space:pre-line;">${escapeHtml(
           originalMessage
         )}</p>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f5f2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e1db;">
        <tr><td style="padding:26px 28px 8px;">
          <span style="font-family:monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#FF6300;">${escapeHtml(
            ownerName
          )}</span>
        </td></tr>
        <tr><td style="padding:6px 28px 28px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#14140f;">
          <h1 style="margin:0 0 18px;font-size:20px;font-weight:600;letter-spacing:-.01em;">Hello,</h1>
          ${paragraphs}
          ${quoted}
          <p style="margin:26px 0 0;font-size:13px;color:#6b6b68;">
            — ${escapeHtml(ownerName)}<br/>
            <a href="${escapeHtml(siteUrl)}" style="color:#FF6300;text-decoration:none;">${escapeHtml(
              siteUrl.replace(/^https?:\/\//, '')
            )}</a>
          </p>
        </td></tr>
        <tr><td style="padding:14px 28px;border-top:1px solid #e2e1db;font-family:monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#929292;">
          Sent from the ${escapeHtml(ownerName)} portfolio
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
