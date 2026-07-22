'use client';

import { useState, useEffect } from 'react';
import { executivesApi } from '@/frontend/lib/api-client';
import { useAuth } from '@/frontend/context/useAuth';
import LoginForm from '@/frontend/components/LoginForm';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Badge from '@/frontend/components/ui/Badge';
import Reveal from '@/frontend/components/ui/Reveal';

const emptyForm = { name: '', position: '', term: '', phone: '', isActive: true };

export default function ExecutivesPage() {
  const { isAuthenticated } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [executiveForm, setExecutiveForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) return;
    executivesApi.list().then(setExecutives);
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoginForm />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executiveForm.name || !executiveForm.position) return;
    if (editingExecutive) {
      const updated = await executivesApi.update(editingExecutive.id, executiveForm);
      setExecutives(executives.map((ex) => (ex.id === editingExecutive.id ? updated : ex)));
      setEditingExecutive(null);
    } else {
      const created = await executivesApi.create(executiveForm);
      setExecutives([...executives, created]);
    }
    setExecutiveForm(emptyForm);
  };

  const handleDelete = async (id) => {
    await executivesApi.remove(id);
    setExecutives(executives.filter((ex) => ex.id !== id));
  };

  const handleEdit = (exec) => {
    setExecutiveForm(exec);
    setEditingExecutive(exec);
  };

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Estate Management</h1>

        <Card className="mt-8">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
            {editingExecutive ? 'Edit Management Member' : 'Add Management Member'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { placeholder: 'Full Name *', key: 'name' },
              { placeholder: 'Position *', key: 'position' },
              { placeholder: 'Term (e.g., 2023-2025)', key: 'term' },
              { placeholder: 'Phone Number', key: 'phone' }
            ].map(({ placeholder, key }) => (
              <Input
                key={key}
                type="text"
                placeholder={placeholder}
                value={executiveForm[key]}
                onChange={(e) => setExecutiveForm({ ...executiveForm, [key]: e.target.value })}
              />
            ))}
            <label className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={executiveForm.isActive}
                onChange={(e) => setExecutiveForm({ ...executiveForm, isActive: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-indigo-600"
              />
              Currently Active
            </label>
            <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
              <Button type="submit">{editingExecutive ? 'Update Member' : 'Add Member'}</Button>
              {editingExecutive && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingExecutive(null);
                    setExecutiveForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {['Current Management', 'Past Management'].map((heading, sectionIdx) => {
          const isActive = sectionIdx === 0;
          const list = executives.filter((e) => e.isActive === isActive);
          if (list.length === 0) return null;
          return (
            <div key={heading} className="mt-10">
              <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">{heading}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((executive, idx) => (
                  <Reveal key={executive.id} delay={Math.min(idx, 6) * 60}>
                    <Card className={`h-full border-t-4 ${isActive ? 'border-t-emerald-500' : 'border-t-slate-300 opacity-80 dark:border-t-slate-700'}`}>
                      <div className="mb-2.5 text-lg font-bold text-slate-900 dark:text-white">{executive.name}</div>
                      <Badge color={isActive ? 'emerald' : 'slate'} className="mb-4">
                        {executive.position}
                      </Badge>
                      <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                        {executive.term && (
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">Term:</strong> {executive.term}
                          </div>
                        )}
                        {executive.phone && (
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">Phone:</strong> {executive.phone}
                          </div>
                        )}
                      </div>
                      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {isActive && (
                          <Button variant="accent" className="flex-1" onClick={() => handleEdit(executive)}>
                            Edit
                          </Button>
                        )}
                        <Button variant="danger" className="flex-1" onClick={() => handleDelete(executive.id)}>
                          Delete
                        </Button>
                      </div>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}

        {executives.length === 0 && (
          <Card className="mt-8 text-center text-slate-400 dark:text-slate-500">No management members added yet.</Card>
        )}
      </div>
    </div>
  );
}
