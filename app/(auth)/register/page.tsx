'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Mail, Lock, User, Building2, ShieldCheck } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student', department: '', bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload as any);
      showToast('Account created! Please check your email to verify.', 'success');
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Create Account</h1>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Your name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          leftIcon={<User className="w-4 h-4" />}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@university.edu"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          error={errors.confirmPassword}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        />
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={form.role}
          disabled
          title="Role is fixed during registration"
        />
        <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">Role is assigned as Student during signup.</p>
        <Input
          label="Department"
          placeholder="e.g. Computer Science"
          value={form.department}
          onChange={set('department')}
          leftIcon={<Building2 className="w-4 h-4" />}
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}
