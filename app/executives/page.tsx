'use client';

import { useState, useEffect } from 'react';
import { executivesApi } from '@/frontend/lib/api-client';
import { useAuth } from '@/frontend/context/useAuth';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Select from '@/frontend/components/ui/Select';
import Badge from '@/frontend/components/ui/Badge';
import Reveal from '@/frontend/components/ui/Reveal';

const emptyForm: Record<string, any> = { name: '', position: '', startYear: '', endYear: '', phone: '', isActive: true, displayOrder: 0 };

const POSITIONS = ['Chairman', 'Vice Chairman', 'Secretary General', 'Treasurer', 'Financial Secretary', 'Welfare Secretary'];

function groupByTenure(list) {
  const byKey = new Map();
  for (const exec of list) {
    const key = `${exec.startYear}-${exec.endYear}`;
    if (!byKey.has(key)) byKey.set(key, { startYear: exec.startYear, endYear: exec.endYear, members: [] });
    byKey.get(key).members.push(exec);
  }
  const groups = [...byKey.values()].map((group) => ({
    ...group,
    members: group.members.sort((a, b) => {
      const rankA = POSITIONS.indexOf(a.position);
      const rankB = POSITIONS.indexOf(b.position);
      const positionDiff = (rankA === -1 ? POSITIONS.length : rankA) - (rankB === -1 ? POSITIONS.length : rankB);
      return positionDiff !== 0 ? positionDiff : (a.displayOrder || 0) - (b.displayOrder || 0);
    })
  }));
  groups.sort((a, b) => b.startYear - a.startYear);
  return groups;
}

function PublicManagementView() {
  const [activeManagement, setActiveManagement] = useState([]);
  const [pastManagement, setPastManagement] = useState([]);

  useEffect(() => {
    executivesApi.activeList().then(setActiveManagement);
    executivesApi.inactiveList().then(setPastManagement);
  }, []);

  const currentTenureGroups = groupByTenure(activeManagement);
  const pastTenureGroups = groupByTenure(pastManagement);

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Estate Management</h1>

        {currentTenureGroups.map(({ startYear, endYear, members }, groupIdx) => (
          <div key={`${startYear}-${endYear}`} className="mt-10">
            {currentTenureGroups.length > 1 && (
              <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
                {startYear}-{endYear}
              </h2>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member, idx) => (
                <Reveal key={member.id} delay={Math.min(idx, 6) * 60 + groupIdx * 80}>
                  <Card className="h-full border-t-4 border-t-emerald-500">
                    <div className="mb-2.5 text-lg font-bold text-slate-900 dark:text-white">{member.name}</div>
                    <Badge color="emerald" className="mb-4">
                      {member.position}
                    </Badge>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Term:</strong> {member.startYear}-{member.endYear}
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        ))}

        {activeManagement.length === 0 && (
          <Card className="mt-8 text-center text-slate-400 dark:text-slate-500">No management members added yet.</Card>
        )}

        {pastTenureGroups.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">Past Management</h2>
            </Reveal>
            {pastTenureGroups.map(({ startYear, endYear, members }, groupIdx) => (
              <Reveal key={`${startYear}-${endYear}`} delay={groupIdx * 80}>
                <div className="mb-8">
                  <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    {startYear}-{endYear}
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                      <Card key={member.id} className="h-full border-t-4 border-t-slate-300 opacity-80 dark:border-t-slate-700">
                        <div className="mb-2.5 text-lg font-bold text-slate-900 dark:text-white">{member.name}</div>
                        <Badge color="slate">{member.position}</Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExecutivesPage() {
  const { isAuthenticated } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [executiveForm, setExecutiveForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) return;
    executivesApi.list().then(setExecutives);
  }, [isAuthenticated]);

  if (!isAuthenticated) return <PublicManagementView />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executiveForm.name || !executiveForm.position || !executiveForm.startYear || !executiveForm.endYear) return;
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
            <Input
              type="text"
              placeholder="Full Name *"
              value={executiveForm.name}
              onChange={(e) => setExecutiveForm({ ...executiveForm, name: e.target.value })}
            />
            <Select value={executiveForm.position} onChange={(e) => setExecutiveForm({ ...executiveForm, position: e.target.value })}>
              <option value="">Position *</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </Select>
            {[
              { placeholder: 'Start Year *', key: 'startYear' },
              { placeholder: 'End Year *', key: 'endYear' }
            ].map(({ placeholder, key }) => (
              <Input
                key={key}
                type="number"
                placeholder={placeholder}
                value={executiveForm[key]}
                onChange={(e) => setExecutiveForm({ ...executiveForm, [key]: e.target.value })}
              />
            ))}
            <Input
              type="text"
              placeholder="Phone Number"
              value={executiveForm.phone}
              onChange={(e) => setExecutiveForm({ ...executiveForm, phone: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Display Order (lower shows first)"
              value={executiveForm.displayOrder}
              onChange={(e) => setExecutiveForm({ ...executiveForm, displayOrder: e.target.value })}
            />
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
          const tenureGroups = groupByTenure(list);
          return (
            <div key={heading} className="mt-10">
              <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">{heading}</h2>
              {tenureGroups.map(({ startYear, endYear, members }, groupIdx) => (
                <Reveal key={`${startYear}-${endYear}`} delay={groupIdx * 80}>
                  <div className="mb-8">
                    {tenureGroups.length > 1 && (
                      <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        {startYear}-{endYear}
                      </h3>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {members.map((executive, idx) => (
                        <Reveal key={executive.id} delay={Math.min(idx, 6) * 60}>
                          <Card className={`h-full border-t-4 ${isActive ? 'border-t-emerald-500' : 'border-t-slate-300 opacity-80 dark:border-t-slate-700'}`}>
                            <div className="mb-2.5 text-lg font-bold text-slate-900 dark:text-white">{executive.name}</div>
                            <Badge color={isActive ? 'emerald' : 'slate'} className="mb-4">
                              {executive.position}
                            </Badge>
                            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                              <div>
                                <strong className="text-slate-700 dark:text-slate-300">Term:</strong> {executive.startYear}-{executive.endYear}
                              </div>
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
                </Reveal>
              ))}
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
