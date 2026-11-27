'use client';

import { useState } from 'react';

type Errors = Record<string, string>;

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notice, setNotice] = useState('');

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function validate() {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = 'Please tell me your name.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(values.email.trim())) next.email = 'That email looks incomplete.';
    if (values.message.trim().length < 10) next.message = 'A few more words, please.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setState('error');
      setNotice('Please check the highlighted fields.');
      return;
    }
    setState('sending');
    setNotice('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setState('error');
        setNotice(data.error || 'Your message could not be sent. Please try again.');
        return;
      }
      setState('sent');
      setNotice('Message received. I will get back to you soon.');
      setValues({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setState('error');
      setNotice('Network error. Please try again.');
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <div className="field" data-invalid={Boolean(errors.name)}>
        <label htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" value={values.name} onChange={set('name')} autoComplete="name" required />
        {errors.name ? <span className="field-error">{errors.name}</span> : null}
      </div>

      <div className="field" data-invalid={Boolean(errors.email)}>
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" value={values.email} onChange={set('email')} autoComplete="email" required />
        {errors.email ? <span className="field-error">{errors.email}</span> : null}
      </div>

      <div className="field span-2">
        <label htmlFor="cf-subject">Subject</label>
        <input id="cf-subject" name="subject" value={values.subject} onChange={set('subject')} />
      </div>

      <div className="field span-2" data-invalid={Boolean(errors.message)}>
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" value={values.message} onChange={set('message')} required />
        {errors.message ? <span className="field-error">{errors.message}</span> : null}
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={set('website')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <div className="span-2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <button type="submit" className="btn btn--accent" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {notice ? (
          <span className={`form-note ${state === 'sent' ? 'form-note--ok' : state === 'error' ? 'form-note--err' : ''}`} role="status">
            {notice}
          </span>
        ) : (
          <span className="meta">Usually replies within a day</span>
        )}
      </div>
    </form>
  );
}
