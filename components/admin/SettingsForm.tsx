'use client';

import { useState } from 'react';
import { adminMutate } from './api';
import type { SiteSettings } from '../../lib/types';
import Uploader from './Uploader';

type Section = 'identity' | 'homepage' | 'about' | 'contact' | 'footer' | 'seo' | 'theme';

const DEFAULTS = {
  dark: {
    bg: '#0B0B0B',
    bgElevated: '#111111',
    fg: '#FFFFFF',
    fgMuted: '#929292',
    line: '#232323',
    accent: '#FF6300',
    accentFg: '#0B0B0B',
    card: '#121211',
  },
  light: {
    bg: '#F5F5F2',
    bgElevated: '#ECEBE6',
    fg: '#0B0B0B',
    fgMuted: '#6B6B68',
    line: '#DBD9D3',
    accent: '#FF6300',
    accentFg: '#FFFFFF',
    card: '#FFFFFF',
  },
};

const TOKEN_LABELS: Record<string, string> = {
  bg: 'Background',
  bgElevated: 'Elevated surface',
  fg: 'Text',
  fgMuted: 'Muted text',
  line: 'Lines / borders',
  accent: 'Accent',
  accentFg: 'On accent',
  card: 'Card surface',
};

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  textarea,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  textarea?: boolean;
}) {
  return (
    <div className="a-field">
      <label htmlFor={name}>{label}</label>
      {textarea ? (
        <textarea id={name} name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} />
      ) : (
        <input id={name} name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} />
      )}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export default function SettingsForm({
  settings,
  sections,
  title,
}: {
  settings: SiteSettings;
  sections: Section[];
  title: string;
}) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const theme = settings.theme ?? {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(null);

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};

    for (const [key, value] of fd.entries()) {
      if (typeof value !== 'string') continue;
      if (key.startsWith('theme_')) {
        const [, mode, token] = key.split('_');
        const group = (payload.theme as Record<string, Record<string, string>>) ?? {};
        group[mode] = { ...(group[mode] ?? {}), [token]: value };
        payload.theme = group;
        continue;
      }
      payload[key] = value;
    }

    const result = await adminMutate('saveSettings', payload);
    setPending(false);
    setState({ ok: result.ok, message: result.message || (result.ok ? 'Settings saved.' : 'Could not save.') });
  }

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const setToken = (key: string, value: string) =>
    setOverrides((prev) => ({ ...prev, [key]: value }));
  const tokenValue = (mode: 'dark' | 'light', token: string) =>
    overrides[`${mode}_${token}`] ??
    (theme[mode] as Record<string, string> | undefined)?.[token] ??
    DEFAULTS[mode][token as keyof (typeof DEFAULTS)['dark']];

  const has = (s: Section) => sections.includes(s);

  return (
    <form onSubmit={onSubmit} className="a-form">
      <div className="a-panel" style={{ margin: 0 }}>
        <div className="a-panel-head">
          <h2>{title}</h2>
          <span style={{ color: 'var(--a-muted)', fontSize: '0.75rem' }}>
            Changes appear on the public site immediately after saving.
          </span>
        </div>
        <div className="a-panel-body a-form">
          {state ? (
            <div className={`a-notice ${state.ok ? 'a-notice--ok' : 'a-notice--err'}`} role="status">
              {state.message}
            </div>
          ) : null}

          {has('identity') && (
            <>
              <div className="a-section-label">Identity</div>
              <div className="a-grid-2">
                <Field name="wordmark" label="Wordmark" defaultValue={settings.wordmark} placeholder="HIRUN HANSAKA" />
                <Field name="owner_name" label="Owner name" defaultValue={settings.owner_name} placeholder="Hirun Hansaka" />
              </div>
              <div className="a-grid-2">
                <Field name="role_line" label="Role line (under the hero)" defaultValue={settings.role_line} />
                <Field name="availability_text" label="Availability badge" defaultValue={settings.availability_text} />
              </div>
              <div className="a-grid-2">
                <Field name="location_label" label="Location label" defaultValue={settings.location_label} />
                <Field
                  name="profile_image_url"
                  label="Profile photograph URL"
                  defaultValue={settings.profile_image_url}
                  hint="Paste a public image URL — it replaces the portrait automatically."
                />
              </div>
              <Uploader
                label="Upload profile photo"
                onUploaded={(url) => {
                  const input = document.getElementById('profile_image_url') as HTMLInputElement | null;
                  if (input) input.value = url;
                }}
              />
            </>
          )}

          {has('homepage') && (
            <>
              <div className="a-section-label">Hero</div>
              <div className="a-section-label">Typewriter effect</div>
              <Field name="hero_roles" label="Typewriter phrases" defaultValue={settings.hero_roles || settings.role_line}
                hint="Separate roles with commas, for example: Web developer, graphic designer, visual content creator." textarea />
              <div className="a-grid-2">
                {([
                  ['hero_type_speed', 'Typing delay (ms per character)', 10, 300, 62],
                  ['hero_type_delete_speed', 'Deleting delay (ms per character)', 5, 200, 26],
                  ['hero_type_hold', 'Pause after each phrase (ms)', 200, 8000, 1500],
                  ['hero_type_start', 'Start delay after loader (ms)', 0, 4000, 260],
                ] as const).map(([key, label, min, max, fallback]) => (
                  <div className="a-field" key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input id={key} name={key} type="number" min={min} max={max} step="1" defaultValue={settings[key] ?? fallback} required />
                  </div>
                ))}
              </div>
              <span className="hint">Lower delay means faster typing. 1000 ms = 1 second. Turn looping off to type all phrases once and stop on the last.</span>
              <div className="a-grid-2">
                {([['hero_type_loop', 'Loop phrases'], ['hero_type_caret', 'Show blinking cursor']] as const).map(([key, label]) => (
                  <div className="a-field" key={key}>
                    <label htmlFor={key}>{label}</label>
                    <select id={key} name={key} defaultValue={String(settings[key] ?? true)}>
                      <option value="true">On</option><option value="false">Off</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="a-grid-2">
                <Field
                  name="hero_greeting"
                  label="Greeting (above your name)"
                  defaultValue={settings.hero_greeting}
                  hint="Shown small and orange, e.g. “Hey there”"
                />
                </div>
              <div className="a-grid-2">
                <Field name="hero_line_1" label="Headline line 1" defaultValue={settings.hero_line_1} />
                <Field name="hero_line_2" label="Headline line 2" defaultValue={settings.hero_line_2} />
              </div>
              <div className="a-grid-2">
                <Field name="hero_line_3" label="Headline line 3" defaultValue={settings.hero_line_3} />
                <Field
                  name="hero_accent"
                  label="Orange word"
                  defaultValue={settings.hero_accent}
                  hint="The word in the headline that renders in the accent colour."
                />
              </div>
              <Field name="hero_scroll_label" label="Scroll cue label" defaultValue={settings.hero_scroll_label} />

              <div className="a-section-label">Section labels</div>
              <div className="a-grid-2">
                <Field name="work_label" label="Work label" defaultValue={settings.work_label} />
                <Field name="work_heading" label="Work heading" defaultValue={settings.work_heading} />
              </div>
              <div className="a-grid-2">
                <Field name="services_label" label="Services label" defaultValue={settings.services_label} />
                <Field name="services_heading" label="Services heading" defaultValue={settings.services_heading} />
              </div>
            </>
          )}

          {has('about') && (
            <>
              <div className="a-section-label">About</div>
              <div className="a-grid-2">
                <Field name="about_label" label="About label" defaultValue={settings.about_label} />
                <Field name="about_heading" label="About heading" defaultValue={settings.about_heading} />
              </div>
              <Field name="about_body" label="Short biography" defaultValue={settings.about_body} textarea />
              <Field
                name="about_bio_long"
                label="Extended note (optional)"
                defaultValue={settings.about_bio_long}
                textarea
                hint="Keep it short — the design is built around brevity."
              />
            </>
          )}

          {has('contact') && (
            <>
              <div className="a-section-label">Contact</div>
              <div className="a-grid-2">
                <Field name="contact_label" label="Contact label" defaultValue={settings.contact_label} />
                <Field name="contact_heading" label="Contact heading" defaultValue={settings.contact_heading} />
              </div>
              <div className="a-grid-3">
                <Field name="contact_email" label="Email" defaultValue={settings.contact_email} />
                <Field name="contact_phone" label="Phone (displayed)" defaultValue={settings.contact_phone} />
                <Field
                  name="contact_whatsapp"
                  label="WhatsApp number"
                  defaultValue={settings.contact_whatsapp}
                  hint="Digits with country code, e.g. 94771234567"
                />
              </div>
              <Field name="contact_location" label="Location" defaultValue={settings.contact_location} />
              <Field
                name="contact_cta_label"
                label="Contact form panel label"
                defaultValue={settings.contact_cta_label}
                hint="Shown above the contact form."
              />
            </>
          )}

          {has('footer') && (
            <>
              <div className="a-section-label">Footer</div>
              <Field name="footer_tagline" label="Footer tagline" defaultValue={settings.footer_tagline} />
              <Field name="footer_note" label="Footer note (optional)" defaultValue={settings.footer_note} />
            </>
          )}

          {has('seo') && (
            <>
              <div className="a-section-label">SEO &amp; metadata</div>
              <Field name="site_title" label="Site title" defaultValue={settings.site_title} />
              <Field
                name="meta_description"
                label="Meta description"
                defaultValue={settings.meta_description}
                textarea
                hint="Aim for 150–160 characters."
              />
              <Field name="og_image_url" label="Open Graph image URL" defaultValue={settings.og_image_url} />
              <Uploader
                label="Upload OG image"
                onUploaded={(url) => {
                  const input = document.getElementById('og_image_url') as HTMLInputElement | null;
                  if (input) input.value = url;
                }}
              />
            </>
          )}

          {has('theme') && (
            <>
              <div className="a-section-label">Theme</div>
              <div className="a-field">
                <label htmlFor="default_theme">Default theme for new visitors</label>
                <select id="default_theme" name="default_theme" defaultValue={settings.default_theme}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
                <span className="hint">Visitors can still override this with the header switcher.</span>
              </div>

              <div className="a-tokens">
                {(['dark', 'light'] as const).map((mode) => (
                  <div className="a-token-set" key={mode}>
                    <h3>{mode} mode</h3>
                    {Object.entries(DEFAULTS[mode]).map(([token, def]) => {
                      const current = tokenValue(mode, token);
                      return (
                        <div className="a-token-row" key={token}>
                          <label htmlFor={`theme_${mode}_${token}`}>{TOKEN_LABELS[token] ?? token}</label>
                          <input
                            type="color"
                            value={current}
                            aria-label={`${TOKEN_LABELS[token]} colour picker`}
                            onChange={(e) => setToken(`${mode}_${token}`, e.target.value.toUpperCase())}
                          />
                          <input
                            id={`theme_${mode}_${token}`}
                            name={`theme_${mode}_${token}`}
                            type="text"
                            value={current}
                            onChange={(e) => setToken(`${mode}_${token}`, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <span className="hint">
                Leave a field as-is to keep the built-in palette. The accent colour drives buttons, highlights and
                the orange word in the headline.
              </span>
            </>
          )}

          <div className="a-actions" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="a-btn a-btn--primary" disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
