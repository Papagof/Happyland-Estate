'use client';

import { useState, useEffect } from 'react';
import { executivesApi } from '@/lib/api-client';
import { useAuth } from '@/context/useAuth';
import LoginForm from '@/components/LoginForm';

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
      setExecutives(executives.map(ex => ex.id === editingExecutive.id ? updated : ex));
      setEditingExecutive(null);
    } else {
      const created = await executivesApi.create(executiveForm);
      setExecutives([...executives, created]);
    }
    setExecutiveForm(emptyForm);
  };

  const handleDelete = async (id) => {
    await executivesApi.remove(id);
    setExecutives(executives.filter(ex => ex.id !== id));
  };

  const handleEdit = (exec) => { setExecutiveForm(exec); setEditingExecutive(exec); };

  const cardStyle = (active) => ({
    background: 'white', padding: '20px', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    borderTop: `4px solid ${active ? '#10B981' : '#CBD5E1'}`,
    opacity: active ? 1 : 0.8
  });

  const badgeStyle = (active) => ({
    display: 'inline-block', background: active ? '#10B981' : '#CBD5E1', color: 'white',
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px'
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '30px' }}>Estate Management</h1>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>
            {editingExecutive ? 'Edit Management Member' : 'Add Management Member'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { placeholder: 'Full Name *', key: 'name' },
              { placeholder: 'Position *', key: 'position' },
              { placeholder: 'Term (e.g., 2023-2025)', key: 'term' },
              { placeholder: 'Phone Number', key: 'phone' }
            ].map(({ placeholder, key }) => (
              <input key={key} type="text" placeholder={placeholder} value={executiveForm[key]} onChange={(e) => setExecutiveForm({...executiveForm, [key]: e.target.value})}
                style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <input type="checkbox" checked={executiveForm.isActive} onChange={(e) => setExecutiveForm({...executiveForm, isActive: e.target.checked})} style={{ cursor: 'pointer' }} />
              <label style={{ cursor: 'pointer' }}>Currently Active</label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: '#1E3A8A', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                {editingExecutive ? 'Update Member' : 'Add Member'}
              </button>
              {editingExecutive && (
                <button type="button" onClick={() => { setEditingExecutive(null); setExecutiveForm(emptyForm); }}
                  style={{ background: '#94A3B8', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {['Current Management', 'Past Management'].map((heading, sectionIdx) => {
          const isActive = sectionIdx === 0;
          const list = executives.filter(e => e.isActive === isActive);
          if (list.length === 0) return null;
          return (
            <div key={heading} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>{heading}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {list.map(executive => (
                  <div key={executive.id} style={cardStyle(isActive)}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '10px' }}>{executive.name}</div>
                    <div style={badgeStyle(isActive)}>{executive.position}</div>
                    <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '15px' }}>
                      {executive.term && <div><strong>Term:</strong> {executive.term}</div>}
                      {executive.phone && <div><strong>Phone:</strong> {executive.phone}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #EEE' }}>
                      {isActive && (
                        <button onClick={() => handleEdit(executive)} style={{ flex: 1, background: '#14B8A6', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                      )}
                      <button onClick={() => handleDelete(executive.id)} style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {executives.length === 0 && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94A3B8' }}>
            No management members added yet.
          </div>
        )}
      </div>
    </div>
  );
}
