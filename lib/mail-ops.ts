import { supabaseAdmin, hasSupabaseEnv } from './supabase';
import { requireSession } from './auth';
import { logActivity } from './queries';
import { mailer, fromAddress, hasMailEnv, replyHtml } from './mailer';

export type MailStatus = 'sent' | 'failed' | 'not_configured';

/**
 * Sends a reply to a contact message over Google SMTP, saves it on the thread,
 * and marks the message as read.
 */
export async function sendReplyOp(payload: Record<string, unknown>) {
  const session = await requireSession();

  const messageId = String(payload.messageId ?? '');
  const body = String(payload.body ?? '').trim();
  const subjectOverride = String(payload.subject ?? '').trim();

  if (!messageId) throw new Error('Missing message id.');
  if (body.length < 2) throw new Error('Write a reply first.');
  if (body.length > 20000) throw new Error('That reply is too long.');

  if (!hasSupabaseEnv()) throw new Error('Database is not configured.');

  const sb = supabaseAdmin();
  const { data: original, error } = await sb
    .from('contact_messages')
    .select('*')
    .eq('id', messageId)
    .maybeSingle();
  if (error) throw error;
  if (!original) throw new Error('That message no longer exists.');

  const baseSubject = original.subject ? `Re: ${original.subject}` : 'Re: your message';
  const subject = subjectOverride || baseSubject;

  let status: MailStatus = 'sent';
  let errorText: string | null = null;
  let providerId: string | null = null;

  if (!hasMailEnv()) {
    status = 'not_configured';
    errorText = 'SMTP_USER / SMTP_PASS are not set, so nothing was emailed.';
  } else {
    try {
      const settings = await sb.from('site_settings').select('owner_name').eq('id', 1).maybeSingle();
      const ownerName = settings.data?.owner_name || 'Hirun Hansaka';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirun-hansaka-portfolio.vercel.app';

      const info = await mailer().sendMail({
        from: fromAddress(),
        to: original.email,
        replyTo: process.env.SMTP_USER,
        subject,
        text: `${body}\n\n— ${ownerName}\n${siteUrl}\n\n---\nYour message:\n${original.message}`,
        html: replyHtml({
          body,
          ownerName,
          siteUrl,
          originalMessage: original.message,
        }),
      });
      providerId = info.messageId ?? null;
    } catch (err) {
      status = 'failed';
      errorText = err instanceof Error ? err.message : 'SMTP error';
      console.error('[sendReply]', errorText);
    }
  }

  const { data: saved, error: insertError } = await sb
    .from('message_replies')
    .insert({
      message_id: messageId,
      body,
      subject,
      sent_by: session.email,
      status,
      provider_id: providerId,
      error: errorText,
    })
    .select('*')
    .single();

  if (insertError) throw insertError;

  if (status === 'sent') {
    await sb.from('contact_messages').update({ status: 'read' }).eq('id', messageId);
  }

  await logActivity(
    status === 'sent' ? `Replied to ${original.email}` : `Reply failed for ${original.email}`,
    'contact_message',
    messageId,
    session.email
  );

  if (status === 'not_configured') {
    return {
      ok: false,
      status,
      savedReplyId: saved.id,
      message:
        'Reply saved, but email is not configured yet. Add SMTP_USER and SMTP_PASS (Gmail App Password) in Vercel to actually send it.',
    };
  }
  if (status === 'failed') {
    return {
      ok: false,
      status,
      savedReplyId: saved.id,
      message: `Reply saved but sending failed: ${errorText}`,
    };
  }
  return { ok: true, status, savedReplyId: saved.id, message: `Reply sent to ${original.email}.` };
}

export async function deleteReplyOp(id: string) {
  await requireSession();
  const { error } = await supabaseAdmin().from('message_replies').delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
}

/** Small self-test so the owner can confirm SMTP works. */
export async function testMailOp() {
  await requireSession();
  if (!hasMailEnv()) {
    return { ok: false, message: 'SMTP_USER and SMTP_PASS are not set.' };
  }
  try {
    await mailer().sendMail({
      from: fromAddress(),
      to: process.env.SMTP_USER as string,
      subject: 'Portfolio SMTP test',
      text: 'If you can read this, your Google SMTP settings work.',
    });
    return { ok: true, message: `Test email sent to ${process.env.SMTP_USER}.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'SMTP error' };
  }
}
