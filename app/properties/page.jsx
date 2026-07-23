'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { propertiesApi } from '@/frontend/lib/api-client';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Select from '@/frontend/components/ui/Select';
import Textarea from '@/frontend/components/ui/Textarea';
import Reveal from '@/frontend/components/ui/Reveal';

const emptyForm = { streetName: '', houseNumber: '', type: 'rent', bedrooms: '', bathrooms: '', price: '', description: '', available: true };

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

const TYPE_LABEL = { sale: 'FOR SALE', rent: 'FOR RENT', both: 'FOR RENT & SALE' };
const TYPE_BANNER = {
  sale: 'bg-indigo-600',
  rent: 'bg-emerald-600',
  both: 'bg-teal-600'
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [propertyForm, setPropertyForm] = useState(emptyForm);

  useEffect(() => {
    propertiesApi.list().then(setProperties);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!propertyForm.streetName || !propertyForm.houseNumber) return;
    const created = await propertiesApi.create(propertyForm);
    setProperties([...properties, created]);
    setPropertyForm(emptyForm);
  };

  const handleDelete = async (id) => {
    await propertiesApi.remove(id);
    setProperties(properties.filter((p) => p.id !== id));
  };

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Properties Available for Rent & Sale</h1>

        <Card className="mt-8">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Add New Property</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select value={propertyForm.streetName} onChange={(e) => setPropertyForm({ ...propertyForm, streetName: e.target.value })}>
              <option value="">Street Name *</option>
              {STREET_NAMES.map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </Select>
            {[
              { placeholder: 'House Number *', key: 'houseNumber', type: 'text' },
              { placeholder: 'Bedrooms', key: 'bedrooms', type: 'number' },
              { placeholder: 'Bathrooms', key: 'bathrooms', type: 'number' }
            ].map(({ placeholder, key, type }) => (
              <Input
                key={key}
                type={type}
                placeholder={placeholder}
                value={propertyForm[key]}
                onChange={(e) => setPropertyForm({ ...propertyForm, [key]: e.target.value })}
              />
            ))}
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Price (₦)"
              value={propertyForm.price ? Number(propertyForm.price).toLocaleString() : ''}
              onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value.replace(/[^\d]/g, '') })}
            />
            <Select value={propertyForm.type} onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value })}>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
              <option value="both">Both Rent & Sale</option>
            </Select>
            <Textarea
              placeholder="Description"
              value={propertyForm.description}
              onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
              className="sm:col-span-2 lg:col-span-3"
            />
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3 dark:text-slate-200">
              <input
                type="checkbox"
                checked={propertyForm.available}
                onChange={(e) => setPropertyForm({ ...propertyForm, available: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-indigo-600"
              />
              Available Now
            </label>
            <Button type="submit" className="sm:col-span-2 lg:col-span-3">
              <Plus size={18} /> Add Property
            </Button>
          </form>
        </Card>

        {properties.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, idx) => (
              <Reveal key={property.id} delay={Math.min(idx, 6) * 60}>
                <Card className="h-full overflow-hidden p-0!">
                  <div className={`px-5 py-4 text-white ${TYPE_BANNER[property.type] || TYPE_BANNER.rent}`}>
                    <div className="mb-1 text-xs font-bold tracking-wide opacity-90">{TYPE_LABEL[property.type] || TYPE_LABEL.rent}</div>
                    <div className="text-lg font-bold">
                      {property.streetName}, {property.houseNumber}
                    </div>
                  </div>
                  <div className="p-5">
                    {!property.available && (
                      <div className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        Currently Unavailable
                      </div>
                    )}
                    <div className="mb-4 grid grid-cols-2 gap-2.5">
                      {property.bedrooms && (
                        <div className="rounded-md bg-slate-50 p-2.5 text-center dark:bg-slate-800">
                          <div className="text-base font-bold text-slate-900 dark:text-white">{property.bedrooms}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Bedrooms</div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="rounded-md bg-slate-50 p-2.5 text-center dark:bg-slate-800">
                          <div className="text-base font-bold text-slate-900 dark:text-white">{property.bathrooms}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Bathrooms</div>
                        </div>
                      )}
                    </div>
                    {property.price && (
                      <div className="mb-4 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        &#8358;{parseInt(property.price, 10).toLocaleString()}
                      </div>
                    )}
                    {property.description && (
                      <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{property.description}</p>
                    )}
                    <Button variant="danger" className="w-full" onClick={() => handleDelete(property.id)}>
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className="mt-8 text-center text-slate-400 dark:text-slate-500">No properties listed yet.</Card>
        )}
      </div>
    </div>
  );
}
