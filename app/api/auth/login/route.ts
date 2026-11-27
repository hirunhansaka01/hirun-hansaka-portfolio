import { NextResponse } from 'next/server';
import { authenticate, createSession } from '../../../../lib/auth';
import { logActivity } from '../../../../lib/queries';

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 8;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(`${ip}:${email.toLowerCase()}`)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

  const user = await authenticate(email, password);
  if (!user) {
    await logActivity('Failed admin login attempt', 'admin_user', null, email);
    return NextResponse.json({ error: 'Those credentials do not match.' }, { status: 401 });
  }

  await createSession(user);
  await logActivity('Signed in to dashboard', 'admin_user', user.id, user.email);

  return NextResponse.json({ ok: true });
}
