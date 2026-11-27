import { createHmac, timingSafeEqual, randomBytes, scryptSync } from 'crypto';
import { cookies } from 'next/headers';
import { supabaseAdmin, hasSupabaseEnv } from './supabase';

const COOKIE = 'hh_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): string {
  return process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me';
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', secret()).update(payload).digest());
}

export type SessionPayload = { sub: string; email: string; name: string; exp: number; ver?: string };

export function createSessionToken(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const candidate = scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Falls back to environment credentials when no admin row exists yet. */
export async function authenticate(email: string, password: string) {
  const normalized = email.trim().toLowerCase();

  if (hasSupabaseEnv()) {
    try {
      const { data } = await supabaseAdmin()
        .from('admin_users')
        .select('*')
        .eq('email', normalized)
        .maybeSingle();
      if (data && verifyPassword(password, data.password_hash)) {
        await supabaseAdmin()
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.id);
        return { id: data.id, email: data.email, name: data.name ?? 'Admin' };
      }
    } catch (err) {
      console.error('[auth] database lookup failed', err);
    }
  }


  return null;
}

export async function createSession(user: { id: string; email: string; name: string }) {
  const { data: row } = await supabaseAdmin().from('admin_users').select('password_hash').eq('id', user.id).single();
  if (!row) throw new Error('Account unavailable');
  const token = createSessionToken({
    ver: sign(row.password_hash),
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const session = verifySessionToken(jar.get(COOKIE)?.value);
  if (!session) return null;
  const { data, error } = await supabaseAdmin().from('admin_users').select('email,name,password_hash').eq('id', session.sub).maybeSingle();
  if (error || !data || session.ver !== sign(data.password_hash)) return null;
  return { ...session, email: data.email, name: data.name || 'Admin' };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}
