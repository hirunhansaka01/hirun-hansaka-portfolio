'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminMutate } from './api';

type User = {id: string; name: string; email: string; role: string};
export default function AccountForms({me, users}: {me: User; users: User[]}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>, op: string) {
    e.preventDefault();
    const form = e.currentTarget;
    if (op === 'deleteUser' && !window.confirm('Remove this account? Its sessions will stop working.')) return;
    setPending(true); setMessage('');
    try {
      const result = await adminMutate(op, Object.fromEntries(new FormData(form)));
      setMessage(result.message || (result.ok ? 'Saved.' : 'Could not save.'));
      if (result.ok) { form.reset(); router.refresh(); }
    } catch { setMessage('Request failed. Please try again.'); }
    finally { setPending(false); }
  }
  const field = (name: string, label: string, type='text', value='', required=true) => (
    <div className="a-field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={value} required={required} autoComplete={type === 'password' ? (name === 'current_password' ? 'current-password' : 'new-password') : undefined} minLength={type === 'password' && name !== 'current_password' ? 12 : undefined} maxLength={type === 'password' ? 128 : 254} /></div>
  );
  return <>
    {message && <div className="a-notice" role="status">{message}</div>}
    <section className="a-panel"><div className="a-panel-head"><h2>My account</h2></div><form className="a-panel-body a-form" onSubmit={e=>submit(e,'updateAccount')}>
      <p>Change your login details. Changing your password signs out your other sessions. Your public contact email is separate.</p>
      {field('name','Display name','text',me.name)}{field('email','Login email','email',me.email)}
      {field('new_password','New password (leave blank to keep current)','password','',false)}
      {field('confirm_password','Confirm new password','password','',false)}
      {field('current_password','Current password to confirm','password')}
      <button className="a-btn a-btn--primary" disabled={pending}>Save my account</button>
    </form></section>
    {me.role === 'owner' && <>
      <section className="a-panel"><div className="a-panel-head"><h2>Add editor account</h2></div><form className="a-panel-body a-form" onSubmit={e=>submit(e,'createUser')}>
        <p>Editors can manage portfolio content and messages, but cannot create or remove accounts. Share their initial password privately; they can change it after signing in.</p>
        {field('name','New user name')}{field('email','New user email','email')}{field('password','Initial password (12+ characters)','password')}{field('current_password','Your current password','password')}
        <button className="a-btn a-btn--primary" disabled={pending}>Create editor</button>
      </form></section>
      <section className="a-panel"><div className="a-panel-head"><h2>Accounts</h2></div><div className="a-panel-body a-form">
        {users.map(u=><div key={u.id}><strong>{u.name}</strong><p>{u.email} · {u.role}{u.id === me.id ? ' · You' : ''}</p>
          {u.role === 'editor' && <form className="a-form" onSubmit={e=>submit(e,'deleteUser')}><input type="hidden" name="id" value={u.id}/><label>Your current password<input name="current_password" type="password" autoComplete="current-password" required /></label><button className="a-btn" disabled={pending}>Remove account</button></form>}
        </div>)}
      </div></section>
    </>}
    <section className="a-panel"><div className="a-panel-body"><h2>Public contact details</h2><p>Edit your public email, phone, WhatsApp and location in <a href="/admin/settings">Website settings</a>. Social links are in <a href="/admin/content">Content</a>.</p><p>Changing a login or public email does not change your Google SMTP sender. SMTP credentials remain protected server environment settings.</p></div></section>
  </>;
}
