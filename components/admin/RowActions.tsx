'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminMutate } from './api';

type Props = {
  op: string;
  payload: Record<string, unknown>;
  label: string;
  variant?: 'default' | 'danger' | 'ghost';
  confirmText?: string;
  size?: 'sm' | 'md';
};

export default function RowAction({
  op,
  payload,
  label,
  variant = 'default',
  confirmText,
  size = 'sm',
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    const result = await adminMutate(op, payload);
    setBusy(false);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    router.refresh();
  }

  const cls =
    'a-btn' +
    (size === 'sm' ? ' a-btn--sm' : '') +
    (variant === 'danger' ? ' a-btn--danger' : variant === 'ghost' ? ' a-btn--ghost' : '');

  return (
    <button type="button" className={cls} onClick={onClick} disabled={busy} title={label}>
      {busy ? '…' : label}
    </button>
  );
}
