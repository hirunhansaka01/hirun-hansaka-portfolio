'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type ActionState = { ok: boolean; message: string } | null;

export async function adminMutate(
  op: string,
  payload: Record<string, unknown> = {}
): Promise<{ ok: boolean; message: string; [key: string]: unknown }> {
  const res = await fetch('/api/admin/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: data.error || 'Request failed.' };
  }
  return { ok: true, message: data.message || '', ...data };
}

/** Small helper for fire-and-forget inline buttons that refresh the route. */
export function useAdminAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run(op: string, payload: Record<string, unknown>) {
    setPending(true);
    const result = await adminMutate(op, payload);
    setPending(false);
    if (result.ok) router.refresh();
    else window.alert(result.message);
    return result;
  }

  return { run, pending };
}
