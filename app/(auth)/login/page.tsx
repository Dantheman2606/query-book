'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Mail, Lock } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const status = new URLSearchParams(window.location.search).get('verified');
    if (status === 'success') {
      showToast('Email verified successfully. You can now sign in.', 'success');
    } else if (status === 'invalid') {
      showToast('Verification link is invalid or expired.', 'error');
    } else if (status === 'missing-token') {
      showToast('Verification token is missing.', 'error');
    }
  }, [showToast]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ email, password });
      router.push('/queries');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Sign In</h1>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" isLoading={isLoading} size="md">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
        Don't have an account?{' '}
        <Link href="/register" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
          Register
        </Link>
      </p>
    </div>
  );
}
