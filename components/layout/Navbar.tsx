'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { clsx } from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { href: '/queries', label: 'Queries' },
    { href: '/announcements', label: 'Announcements' },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link href="/queries" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight hidden sm:block">
            Query<span className="text-brand-500">Book</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-0.5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {/* User dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar name={user.name} src={user.avatarUrl || undefined} size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 card animate-fade-in z-50 py-1 shadow-lg">
                  {/* User info */}
                  <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                    <Badge role={user.role} className="mt-1.5 capitalize">{user.role}</Badge>
                  </div>
                  {/* Links */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
