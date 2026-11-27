import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import AccountForms from '../../../components/admin/AccountForms';
export const dynamic = 'force-dynamic';
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const sb = supabaseAdmin();
  const { data: me } = await sb.from('admin_users').select('id,name,email,role').eq('id',session.sub).single();
  if (!me) redirect('/admin/login');
  const { data: users } = me.role === 'owner' ? await sb.from('admin_users').select('id,name,email,role').order('created_at') : { data: [] };
  return <><div className="a-topbar"><div><span className="a-crumb">Dashboard / Account</span><h1 className="a-title">Account & users</h1></div></div><AccountForms me={me} users={users || []}/></>;
}
