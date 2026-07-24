'use client';

import { useState, useEffect } from 'react';
import { Trash2, UserPlus, KeyRound } from 'lucide-react';
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
  const [passwordEditId, setPasswordEditId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const startPasswordEdit = (id) => {
    setPasswordEditId(id);
    setNewPassword('');
    setPasswordError('');
  };

  const cancelPasswordEdit = () => {
    setPasswordEditId(null);
    setNewPassword('');
    setPasswordError('');
  };

  const handleChangePassword = async (e, id) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword) return;
    try {
      await usersApi.changePassword(id, newPassword);
      cancelPasswordEdit();
    } catch (err) {
      setPasswordError(err.message);
    }
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

                  {passwordEditId === u.id ? (
                    <form onSubmit={(e) => handleChangePassword(e, u.id)} className="border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Input
                        type="password"
                        placeholder="New password *"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                      />
                      {passwordError && <div className="mt-2 text-sm font-medium text-red-500">{passwordError}</div>}
                      <div className="mt-3 flex gap-2">
                        <Button type="submit" variant="success" className="flex-1">
                          Save
                        </Button>
                        <Button type="button" variant="secondary" className="flex-1" onClick={cancelPasswordEdit}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button variant="accent" className="flex-1" onClick={() => startPasswordEdit(u.id)}>
                        <KeyRound size={14} /> Change Password
                      </Button>
                      {u.id !== currentUser.id && (
                        <Button variant="danger" className="flex-1" onClick={() => handleDelete(u.id)}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      )}
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
