import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { supabaseAdmin, hasSupabaseEnv } from '../../../lib/supabase';

/**
 * Admin-only image upload → Supabase Storage bucket `media`.
 * Returns a public URL that can be pasted into any image field.
 */
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Storage is not configured.' }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is larger than 6 MB.' }, { status: 413 });
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${new Date().getFullYear()}/${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  try {
    const sb = supabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await sb.storage.from('media').upload(path, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) throw error;

    const { data } = sb.storage.from('media').getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json(
      { error: 'Upload failed. Make sure the `media` bucket exists and is public.' },
      { status: 500 }
    );
  }
}
