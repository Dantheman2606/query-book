'use client';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f0f13]">
      <Navbar />
      <main className="flex-1 max-w-[1680px] mx-auto w-full px-4 md:px-6 xl:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
