import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '../../../../lib/auth';
import {
  addContentOp,
  deleteContentOp,
  deleteMessageOp,
  deleteProjectOp,
  duplicateProjectOp,
  moveProjectOp,
  saveProjectOp,
  saveSettingsOp,
  setMessageStatusOp,
  toggleProjectOp,
} from '../../../../lib/admin-ops';
import { deleteReplyOp, sendReplyOp, testMailOp } from '../../../../lib/mail-ops';

/** Single authenticated mutation endpoint for the admin dashboard. */

function refresh(scope?: string) {
  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath('/work/[slug]', 'page');
  revalidatePath('/admin');
  if (scope) revalidatePath(scope);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
  }

  let body: { op?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const op = body.op ?? '';
  const p = body.payload ?? {};

  try {
    switch (op) {
      case 'saveProject': {
        const result = await saveProjectOp(p);
        refresh('/admin/projects');
        return NextResponse.json({ ok: true, ...result, message: 'Project saved.' });
      }
      case 'deleteProject':
        await deleteProjectOp(String(p.id ?? ''));
        refresh('/admin/projects');
        return NextResponse.json({ ok: true, message: 'Project deleted.' });
      case 'toggleProject':
        await toggleProjectOp(String(p.id ?? ''), String(p.next ?? ''));
        refresh('/admin/projects');
        return NextResponse.json({ ok: true });
      case 'moveProject':
        await moveProjectOp(String(p.id ?? ''), String(p.dir ?? 'up'));
        refresh('/admin/projects');
        return NextResponse.json({ ok: true });
      case 'duplicateProject':
        await duplicateProjectOp(String(p.id ?? ''));
        refresh('/admin/projects');
        return NextResponse.json({ ok: true, message: 'Duplicated.' });
      case 'setMessageStatus':
        await setMessageStatusOp(String(p.id ?? ''), String(p.status ?? ''));
        refresh('/admin/messages');
        return NextResponse.json({ ok: true });
      case 'deleteMessage':
        await deleteMessageOp(String(p.id ?? ''));
        refresh('/admin/messages');
        return NextResponse.json({ ok: true });
      case 'sendReply': {
        const result = await sendReplyOp(p);
        refresh('/admin/messages');
        return NextResponse.json(result);
      }
      case 'deleteReply':
        await deleteReplyOp(String(p.id ?? ''));
        refresh('/admin/messages');
        return NextResponse.json({ ok: true, message: 'Reply deleted.' });
      case 'testMail':
        return NextResponse.json(await testMailOp());
      case 'saveSettings':
        await saveSettingsOp(p);
        refresh('/admin/settings');
        refresh('/admin/content');
        return NextResponse.json({ ok: true, message: 'Settings saved.' });
      case 'addContent':
        await addContentOp(String(p.kind ?? ''), (p.data as Record<string, unknown>) ?? {});
        refresh('/admin/content');
        return NextResponse.json({ ok: true, message: 'Added.' });
      case 'deleteContent':
        await deleteContentOp(String(p.kind ?? ''), String(p.id ?? ''));
        refresh('/admin/content');
        return NextResponse.json({ ok: true, message: 'Removed.' });
      default:
        return NextResponse.json({ error: `Unknown operation: ${op}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    console.error('[admin mutation]', op, message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
