'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Activity, LayoutDashboard, ScrollText, Tag, UsersRound } from 'lucide-react';

const links = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === '/admin',
  },
  {
    href: '/admin/logs',
    label: 'Logs',
    icon: ScrollText,
    match: (pathname: string) => pathname.startsWith('/admin/logs'),
  },
  {
    href: '/admin/users',
    label: 'User Roles',
    icon: UsersRound,
    match: (pathname: string) => pathname.startsWith('/admin/users'),
  },
  {
    href: '/admin/tags',
    label: 'Tags',
    icon: Tag,
    match: (pathname: string) => pathname.startsWith('/admin/tags'),
  },
  {
    href: '/admin/system',
    label: 'System Health',
    icon: Activity,
    match: (pathname: string) => pathname.startsWith('/admin/system'),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="card p-3 sticky top-20">
        <h2 className="px-2 pb-2 text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
          Admin Console
        </h2>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = link.match(pathname);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-100/80 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
