'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/messages', label: 'Messages', badge: true },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminShell({
  children,
  email,
  name,
  unread,
}: {
  children: React.ReactNode;
  email: string;
  name: string;
  unread: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="admin-root">
      <aside className="a-sidebar">
        <div className="a-brand">
          <span className="sq">H</span>
          Studio Admin
        </div>

        <nav className="a-nav" aria-label="Dashboard">
          <span className="a-nav-label">Manage</span>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
              {item.label}
              {item.badge && unread > 0 ? <span className="badge">{unread}</span> : null}
            </Link>
          ))}
        </nav>

        <div className="a-nav">
          <span className="a-nav-label">Site</span>
          <a href="/" target="_blank" rel="noreferrer">
            View live site ↗
          </a>
        </div>

        <div className="a-sidebar-foot">
          <div className="a-user">
            <span className="av">{(name || email).slice(0, 2).toUpperCase()}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
          </div>
          <button type="button" className="a-signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="a-main">
        <div className="a-mobile-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>
        {children}
      </main>
    </div>
  );
}
