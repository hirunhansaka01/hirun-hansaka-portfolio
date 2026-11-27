import { NextResponse } from 'next/server';
import { supabaseAdmin, hasSupabaseEnv } from '../../../lib/supabase';
import { logActivity } from '../../../lib/queries';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Very light in-memory throttle (per instance). */
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const subject = String(body.subject ?? '').trim();
  const message = String(body.message ?? '').trim();
  const honeypot = String(body.website ?? '').trim();

  if (honeypot) return NextResponse.json({ ok: true }); // silently drop bots

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please tell me your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'That email address looks incomplete.';
  if (message.length < 10) errors.message = 'A few more words, please (10+ characters).';
  if (message.length > 5000) errors.message = 'That message is a little too long.';

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (throttled(ip)) {
    return NextResponse.json(
      { error: 'You just sent a message. Please try again in a minute.' },
      { status: 429 }
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: 'The contact inbox is not configured yet. Please email me directly.' },
      { status: 503 }
    );
  }

  try {
    const { error } = await supabaseAdmin().from('contact_messages').insert({
      name,
      email,
      subject: subject || null,
      message,
      status: 'unread',
    });
    if (error) throw error;
    await logActivity('New contact message', 'contact_message', null, email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json(
      { error: 'Something went wrong on my end. Please email me directly.' },
      { status: 500 }
    );
  }
}
