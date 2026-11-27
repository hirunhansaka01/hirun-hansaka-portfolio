import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge middleware. Uses Web Crypto only (no node:crypto) so it can run on the
 * edge runtime. Session format: base64url(json).base64url(hmacSHA256).
 */

const COOKIE = 'hh_session';

function b64urlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let bin = '';
  view.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verify(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  const secret = process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  if (bytesToB64url(mac) !== sig) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as { exp?: number };
    return Boolean(payload.exp && payload.exp > Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ok = await verify(req.cookies.get(COOKIE)?.value);

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === '/admin/login' && ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
