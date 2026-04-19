import { ThemeProvider } from 'next-themes';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Query<span className="text-brand-500">Book</span>
          </span>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Academic Q&A Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
