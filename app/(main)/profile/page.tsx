'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import * as userService from '@/lib/services/userService';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { User, Building2, FileText, Link2, Save, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    department: user?.department ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.bio.length > 200) e.bio = 'Bio must be under 200 characters';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      await userService.updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        department: form.department.trim(),
        avatarUrl: form.avatarUrl.trim() || undefined,
      });
      await refreshUser();
      showToast('Profile updated!', 'success');
      setEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      department: user?.department ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    });
    setEditing(false);
    setErrors({});
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="w-5 h-5 text-brand-500" /> My Profile
      </h1>

      <div className="card p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Avatar name={user.name} src={user.avatarUrl || undefined} size="xl" />
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Badge role={user.role} className="capitalize">{user.role}</Badge>
              {!user.isVerified && (
                <Badge variant="amber">Unverified</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        {editing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Department"
              value={form.department}
              onChange={set('department')}
              leftIcon={<Building2 className="w-4 h-4" />}
            />
            <Input
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={set('avatarUrl')}
              leftIcon={<Link2 className="w-4 h-4" />}
              placeholder="https://…"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio <span className="text-gray-400">({form.bio.length}/200)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={3}
                maxLength={200}
                className="input-base resize-none"
                placeholder="Tell the community a little about yourself…"
              />
              {errors.bio && <p className="text-xs text-rose-600">{errors.bio}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleSave} isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={user.department || '—'} />
            <InfoRow icon={<FileText className="w-4 h-4" />} label="Bio" value={user.bio || '—'} />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-gray-400 dark:text-gray-500">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
      </div>
    </div>
  );
}
