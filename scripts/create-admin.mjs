#!/usr/bin/env node
/**
 * Creates (or updates) an admin account in Supabase.
 *
 *   node scripts/create-admin.mjs <email> <password> [name]
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or the env.
 */
import { readFileSync, existsSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const [email, password, name = 'Admin'] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [name]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const password_hash = `scrypt:${salt}:${hash}`;

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: existing } = await sb
  .from('admin_users')
  .select('id')
  .eq('email', email.toLowerCase())
  .maybeSingle();

if (existing) {
  const { error } = await sb
    .from('admin_users')
    .update({ password_hash, name })
    .eq('id', existing.id);
  if (error) throw error;
  console.log(`Updated password for ${email}`);
} else {
  const { error } = await sb
    .from('admin_users')
    .insert({ email: email.toLowerCase(), name, password_hash });
  if (error) throw error;
  console.log(`Created admin account for ${email}`);
}
