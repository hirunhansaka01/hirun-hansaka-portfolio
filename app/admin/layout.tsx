import type { Metadata } from 'next';
import './admin.css';
import { getSession } from '../../lib/auth';
import AdminShell from '../../components/admin/AdminShell';
import { getDashboardStats } from '../../lib/queries';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The login page renders on its own (no shell).
  if (!session) {
    return <>{children}</>;
  }

  const stats = await getDashboardStats();

  return (
    <AdminShell email={session.email} name={session.name} unread={stats.unread}>
      {children}
    </AdminShell>
  );
}
