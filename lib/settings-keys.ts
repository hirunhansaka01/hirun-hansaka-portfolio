/**
 * Editable `site_settings` text columns.
 *
 * Kept in one place because three layers must agree on it: the TypeScript row
 * type, the admin save operation (allow-list, so a request can never write an
 * arbitrary column) and the dashboard form.
 */
export const TEXT_KEYS = [
  'site_title',
  'meta_description',
  'og_image_url',
  'wordmark',
  'owner_name',
  'role_line',
  'availability_text',
  'location_label',
  'hero_greeting',
  'hero_roles',
  'hero_tagline',
  'hero_cta_primary',
  'hero_cta_secondary',
  'contact_cta_label',
  'work_label',
  'work_heading',
  'about_label',
  'about_heading',
  'about_body',
  'about_bio_long',
  'profile_image_url',
  'services_label',
  'services_heading',
  'contact_label',
  'contact_heading',
  'contact_email',
  'contact_phone',
  'contact_whatsapp',
  'contact_location',
  'footer_tagline',
  'footer_note',
] as const;

/** Numeric / boolean typewriter controls, saved alongside the text keys. */
export const NUM_KEYS = ['hero_type_speed', 'hero_type_delete_speed', 'hero_type_hold', 'hero_type_start'] as const;
export const BOOL_KEYS = ['hero_type_loop', 'hero_type_caret'] as const;

export type TextKey = (typeof TEXT_KEYS)[number];
