'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminMutate } from './api';

export default function DeleteProjectButton({
  id,
  title,
  label = 'Delete project',
}: {
  id: string;
  title: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className="a-btn a-btn--danger"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setBusy(true);
        const result = await adminMutate('deleteProject', { id });
        setBusy(false);
        if (!result.ok) {
          window.alert(result.message);
          return;
        }
        router.push('/admin/projects');
        router.refresh();
      }}
    >
      {busy ? 'Deleting…' : label}
    </button>
  );
}
