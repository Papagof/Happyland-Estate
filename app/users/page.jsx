'use client';

import { useState, useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { usersApi } from '@/frontend/lib/api-client';
import { useAuth } from '@/frontend/context/useAuth';
import LoginForm from '@/frontend/components/LoginForm';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Select from '@/frontend/components/ui/Select';
import Badge from '@/frontend/components/ui/Badge';
import Reveal from '@/frontend/components/ui/Reveal';

const emptyForm = { username: '', password: '', role: 'staff' };

export default function UsersPage() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    usersApi.list().then(setUsers);
  }, [currentUser]);

  if (!isAuthenticated) return <LoginForm />;
  if (currentUser.role !== 'admin') {
    return <div className="px-5 py-16 text-center text-slate-400 dark:text-slate-500">Admins only.</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) return;
    try {
      const created = await usersApi.create(formData);
      setUsers([...users, created]);
      setFormData(emptyForm);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    await usersApi.remove(id);
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Accounts</h1>

        <Card className="mt-8">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Add New User</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              type="text"
              placeholder="Username *"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>
            <div className="sm:col-span-3">
              {error && <div className="mb-3 text-sm font-medium text-red-500">{error}</div>}
              <Button type="submit">
                <UserPlus size={16} /> Add User
              </Button>
            </div>
          </form>
        </Card>

        {users.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u, idx) => (
              <Reveal key={u.id} delay={Math.min(idx, 6) * 60}>
                <Card className="h-full">
                  <div className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{u.username}</div>
                  <Badge color={u.role === 'admin' ? 'indigo' : 'emerald'} className="mb-4">
                    {u.role.toUpperCase()}
                  </Badge>
                  {u.id !== currentUser.id && (
                    <div className="flex border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button variant="danger" className="flex-1" onClick={() => handleDelete(u.id)}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className="mt-8 text-center text-slate-400 dark:text-slate-500">No user accounts yet.</Card>
        )}
      </div>
    </div>
  );
}
