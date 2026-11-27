import { requireSession, verifyPassword, hashPassword, createSession } from './auth';
import { supabaseAdmin } from './supabase';

function email(value: unknown) {
  const v = String(value || '').trim().toLowerCase();
  if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new Error('Enter a valid email address.');
  return v;
}
function password(value: unknown) {
  const v = String(value || '');
  if (v.length < 12 || v.length > 128) throw new Error('Use a password between 12 and 128 characters.');
  return v;
}
export async function accountOp(op: string, p: Record<string, unknown>) {
  const session = await requireSession();
  const sb = supabaseAdmin();
  const { data: me } = await sb.from('admin_users').select('*').eq('id', session.sub).single();
  if (!me || !verifyPassword(String(p.current_password || ''), me.password_hash)) throw new Error('Your current password is incorrect.');
  if (op === 'updateAccount') {
    const update: Record<string, string> = { email: email(p.email), name: String(p.name || '').trim().slice(0, 100) };
    if (!update.name) throw new Error('Your name is required.');
    if (p.new_password) {
      if (p.new_password !== p.confirm_password) throw new Error('New passwords do not match.');
      update.password_hash = hashPassword(password(p.new_password));
    }
    const { error } = await sb.from('admin_users').update(update).eq('id', me.id);
    if (error) throw new Error(error.code === '23505' ? 'That email is already in use.' : 'Could not update account.');
    await createSession({ id: me.id, email: update.email, name: update.name });
    return;
  }
  if (me.role !== 'owner') throw new Error('Only an owner can manage accounts.');
  if (op === 'createUser') {
    const name = String(p.name || '').trim().slice(0,100);
    if (!name) throw new Error('A name is required.');
    const { error } = await sb.from('admin_users').insert({name, email: email(p.email), password_hash: hashPassword(password(p.password)), role: 'editor'});
    if (error) throw new Error(error.code === '23505' ? 'That email is already in use.' : 'Could not create account.');
  } else if (op === 'deleteUser') {
    if (p.id === me.id) throw new Error('You cannot delete your own account.');
    // Owners cannot be removed through this endpoint, preventing owner lockout.
    const { data, error } = await sb.from('admin_users').delete().eq('id', String(p.id)).eq('role','editor').select('id');
    if (error || !data?.length) throw new Error('Only editor accounts can be removed.');
  } else throw new Error('Unknown account operation.');
}
