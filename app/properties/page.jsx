'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { propertiesApi } from '@/frontend/lib/api-client';

const emptyForm = { streetName: '', houseNumber: '', type: 'rent', bedrooms: '', bathrooms: '', price: '', description: '', available: true };

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
    setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '30px' }}>
          Properties Available for Rent & Sale
        </h1>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '20px' }}>Add New Property</h2>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { placeholder: 'Street Name *', key: 'streetName', type: 'text' },
              { placeholder: 'House Number *', key: 'houseNumber', type: 'text' },
              { placeholder: 'Bedrooms', key: 'bedrooms', type: 'number' },
              { placeholder: 'Bathrooms', key: 'bathrooms', type: 'number' },
              { placeholder: 'Price (₦)', key: 'price', type: 'number' }
            ].map(({ placeholder, key, type }) => (
              <input key={key} type={type} placeholder={placeholder} value={propertyForm[key]}
                onChange={(e) => setPropertyForm({...propertyForm, [key]: e.target.value})}
                style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            ))}
            <select value={propertyForm.type} onChange={(e) => setPropertyForm({...propertyForm, type: e.target.value})}
              style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
              <option value="both">Both Rent & Sale</option>
            </select>
            <textarea placeholder="Description" value={propertyForm.description}
              onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
              style={{ gridColumn: '1 / -1', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical' }} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={propertyForm.available} onChange={(e) => setPropertyForm({...propertyForm, available: e.target.checked})} style={{ cursor: 'pointer' }} />
              <label style={{ cursor: 'pointer' }}>Available Now</label>
            </div>
            <button type="submit" style={{ gridColumn: '1 / -1', background: '#1E3A8A', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Add Property
            </button>
          </form>
        </div>
        {properties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {properties.map(property => (
              <div key={property.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                <div style={{ background: property.type === 'sale' ? '#2563EB' : property.type === 'rent' ? '#10B981' : '#14B8A6', padding: '15px', color: 'white' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', opacity: 0.9 }}>
                    {property.type === 'sale' ? 'FOR SALE' : property.type === 'rent' ? 'FOR RENT' : 'FOR RENT & SALE'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{property.streetName}, {property.houseNumber}</div>
                </div>
                <div style={{ padding: '20px' }}>
                  {!property.available && (
                    <div style={{ background: '#FFF3CD', color: '#856404', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', fontWeight: 'bold' }}>Currently Unavailable</div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    {property.bedrooms && (
                      <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E3A8A' }}>{property.bedrooms}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Bedrooms</div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E3A8A' }}>{property.bathrooms}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Bathrooms</div>
                      </div>
                    )}
                  </div>
                  {property.price && <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981', marginBottom: '15px' }}>₦{parseInt(property.price).toLocaleString()}</div>}
                  {property.description && <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '15px', lineHeight: '1.5' }}>{property.description}</p>}
                  <button onClick={() => handleDelete(property.id)} style={{ width: '100%', background: '#EF4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    <Trash2 size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94A3B8' }}>
            No properties listed yet.
          </div>
        )}
      </div>
    </div>
  );
}
