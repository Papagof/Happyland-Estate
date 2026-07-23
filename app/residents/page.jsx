'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { residentsApi } from '@/frontend/lib/api-client';
import { useAuth } from '@/frontend/context/useAuth';
import LoginForm from '@/frontend/components/LoginForm';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Select from '@/frontend/components/ui/Select';
import Badge from '@/frontend/components/ui/Badge';
import Reveal from '@/frontend/components/ui/Reveal';

const emptyForm = { name: '', phone: '', email: '', streetName: '', houseNumber: '', type: 'resident', occupation: '', moveInDate: '' };

const STREET_NAMES = [
  'Peace Close',
  'Felicia Momoh Close',
  'Achief Close',
  'HalelluJah Close',
  'John Agabri Road',
  'Saluala Kadiku Street',
  'Cedar Street',
  'Maple Street',
  'Samuel Ukpong Street',
  'Oladoyin Ishola',
  'Alhaji Ekemode Street',
  'Sanyaolu Close',
  'Favour Honour Street',
  'Alhaji Ariyo Street'
];

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
      setResidents(residents.map((r) => (r.id === editingResident.id ? updated : r)));
      setEditingResident(null);
    } else {
      const created = await residentsApi.create(formData);
      setResidents([...residents, created]);
    }
    setFormData(emptyForm);
  };

  const handleDelete = async (id) => {
    await residentsApi.remove(id);
    setResidents(residents.filter((r) => r.id !== id));
  };

  const handleEdit = (resident) => {
    setFormData(resident);
    setEditingResident(resident);
  };

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Residents & Landlords Management</h1>

        <Card className="mt-8">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
            {editingResident ? 'Edit Resident/Landlord' : 'Add New Resident/Landlord'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { type: 'text', placeholder: 'Full Name *', key: 'name' },
              { type: 'tel', placeholder: 'Phone Number', key: 'phone' },
              { type: 'email', placeholder: 'Email Address', key: 'email' }
            ].map(({ type, placeholder, key }) => (
              <Input
                key={key}
                type={type}
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              />
            ))}
            <Select value={formData.streetName} onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}>
              <option value="">Street Name *</option>
              {STREET_NAMES.map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </Select>
            {[
              { type: 'text', placeholder: 'House Number *', key: 'houseNumber' },
              { type: 'text', placeholder: 'Occupation', key: 'occupation' },
              { type: 'date', placeholder: 'Move-in Date', key: 'moveInDate' }
            ].map(({ type, placeholder, key }) => (
              <Input
                key={key}
                type={type}
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              />
            ))}
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="resident">Resident</option>
              <option value="landlord">Landlord</option>
              <option value="both">Both</option>
            </Select>
            <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
              <Button type="submit">{editingResident ? 'Update Resident' : 'Add Resident'}</Button>
              {editingResident && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingResident(null);
                    setFormData(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {residents.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {residents.map((resident, idx) => (
              <Reveal key={resident.id} delay={Math.min(idx, 6) * 60}>
                <Card className="h-full border-l-4 border-l-emerald-500 data-[type=landlord]:border-l-indigo-500" data-type={resident.type}>
                  <div className="mb-4">
                    <div className="mb-1.5 text-lg font-bold text-slate-900 dark:text-white">{resident.name}</div>
                    <Badge color={resident.type === 'landlord' ? 'indigo' : 'emerald'}>{resident.type.toUpperCase()}</Badge>
                  </div>
                  <div className="space-y-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Address:</strong> {resident.streetName}, {resident.houseNumber}
                    </div>
                    {resident.phone && (
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300">Phone:</strong> {resident.phone}
                      </div>
                    )}
                    {resident.email && (
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300">Email:</strong> {resident.email}
                      </div>
                    )}
                    {resident.occupation && (
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300">Occupation:</strong> {resident.occupation}
                      </div>
                    )}
                    {resident.moveInDate && (
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300">Move-in:</strong> {resident.moveInDate}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Button variant="accent" className="flex-1" onClick={() => handleEdit(resident)}>
                      <Edit2 size={14} /> Edit
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={() => handleDelete(resident.id)}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className="mt-8 text-center text-slate-400 dark:text-slate-500">No residents or landlords added yet.</Card>
        )}
      </div>
    </div>
  );
}
