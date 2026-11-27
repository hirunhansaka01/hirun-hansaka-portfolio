import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client. Uses the service role key so we can keep Row
 * Level Security enabled with zero anon policies: all reads/writes go through
 * this app's server code (server components + API routes).
 *
 * NEVER import this file from a client component.
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'Copy .env.example to .env.local and fill them in.'
    );
  }

  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { 'X-Client-Info': 'hirun-portfolio-server' },
        // Next patches global fetch and caches GETs by default, which makes
        // builds and ISR serve stale CMS content. Page-level `revalidate`
        // already handles caching, so keep these requests uncached.
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    });
  }
  return cached;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
