'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { residentsApi } from '@/lib/api-client';
import { useAuth } from '@/context/useAuth';
import LoginForm from '@/components/LoginForm';

const emptyForm = { name: '', phone: '', email: '', streetName: '', houseNumber: '', type: 'resident', occupation: '', moveInDate: '' };

export default function ResidentsPage() {
  const { isAuthenticated } = useAuth();
  const [residents, setResidents] = useState([]);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) return;
    residentsApi.list().then(setResidents);
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoginForm />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.streetName || !formData.houseNumber) return;
    if (editingResident) {
      const updated = await residentsApi.update(editingResident.id, formData);
      setResidents(residents.map(r => r.id === editingResident.id ? updated : r));
      setEditingResident(null);
    } else {
      const created = await residentsApi.create(formData);
      setResidents([...residents, created]);
    }
    setFormData(emptyForm);
  };

  const handleDelete = async (id) => {
    await residentsApi.remove(id);
    setResidents(residents.filter(r => r.id !== id));
  };

  const handleEdit = (resident) => { setFormData(resident); setEditingResident(resident); };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '30px' }}>
          Residents & Landlords Management
        </h1>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>
            {editingResident ? 'Edit Resident/Landlord' : 'Add New Resident/Landlord'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { type: 'text', placeholder: 'Full Name *', key: 'name' },
              { type: 'tel', placeholder: 'Phone Number', key: 'phone' },
              { type: 'email', placeholder: 'Email Address', key: 'email' },
              { type: 'text', placeholder: 'Street Name *', key: 'streetName' },
              { type: 'text', placeholder: 'House Number *', key: 'houseNumber' },
              { type: 'text', placeholder: 'Occupation', key: 'occupation' },
              { type: 'date', placeholder: 'Move-in Date', key: 'moveInDate' }
            ].map(({ type, placeholder, key }) => (
              <input key={key} type={type} placeholder={placeholder} value={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            ))}
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
              <option value="resident">Resident</option>
              <option value="landlord">Landlord</option>
              <option value="both">Both</option>
            </select>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: '#1E3A8A', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                {editingResident ? 'Update Resident' : 'Add Resident'}
              </button>
              {editingResident && (
                <button type="button" onClick={() => { setEditingResident(null); setFormData(emptyForm); }}
                  style={{ background: '#94A3B8', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        {residents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {residents.map(resident => (
              <div key={resident.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', borderLeft: `4px solid ${resident.type === 'landlord' ? '#2563EB' : '#10B981'}` }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '5px' }}>{resident.name}</div>
                  <div style={{ display: 'inline-block', background: resident.type === 'landlord' ? '#2563EB' : '#10B981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {resident.type.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.8', marginBottom: '15px' }}>
                  <div><strong>Address:</strong> {resident.streetName}, {resident.houseNumber}</div>
                  {resident.phone && <div><strong>Phone:</strong> {resident.phone}</div>}
                  {resident.email && <div><strong>Email:</strong> {resident.email}</div>}
                  {resident.occupation && <div><strong>Occupation:</strong> {resident.occupation}</div>}
                  {resident.moveInDate && <div><strong>Move-in:</strong> {resident.moveInDate}</div>}
                </div>
                <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #EEE' }}>
                  <button onClick={() => handleEdit(resident)} style={{ flex: 1, background: '#14B8A6', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(resident.id)} style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94A3B8' }}>
            No residents or landlords added yet.
          </div>
        )}
      </div>
    </div>
  );
}
