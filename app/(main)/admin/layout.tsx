'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/queries');
    }
  }, [isLoading, user, router]);

  if (isLoading) return <PageSpinner />;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <AdminSidebar />
      <section className="flex-1 min-w-0">{children}</section>
    </div>
  );
}
