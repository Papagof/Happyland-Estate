'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/frontend/context/useAuth';
import Button from '@/frontend/components/ui/Button';
import Card from '@/frontend/components/ui/Card';
import Input from '@/frontend/components/ui/Input';
import { labelClass } from '@/frontend/components/ui/fieldStyles';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16">
      <Card className="w-full max-w-md animate-fade-in-up">
        <div className="mb-2 flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400">
          <Lock size={20} />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Authorized Access Only</h1>
        </div>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          This page is restricted to estate admins and staff.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className={labelClass}>Username</label>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-sm font-medium text-red-500">{error}</div>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
