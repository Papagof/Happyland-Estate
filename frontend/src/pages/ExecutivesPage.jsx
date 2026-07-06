import { useState } from 'react';
import { executivesApi } from '../api/client';

const emptyForm = {
  name: '',
  position: '',
  term: '',
  phone: '',
  isActive: true
};

export default function ExecutivesPage({ executives, setExecutives }) {
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [executiveForm, setExecutiveForm] = useState(emptyForm);

  const handleAddExecutive = async (e) => {
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

  const handleDeleteExecutive = async (id) => {
    await executivesApi.remove(id);
    setExecutives(executives.filter(ex => ex.id !== id));
  };

  const handleEditExecutive = (executive) => {
    setExecutiveForm(executive);
    setEditingExecutive(executive);
  };

  return (
    <div style={{
      background: '#F8FAFC',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1E3A8A',
          marginBottom: '30px'
        }}>
          Estate Management
        </h1>

        {/* Add Executive Form */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1E3A8A',
            marginBottom: '20px'
          }}>
            {editingExecutive ? 'Edit Management Member' : 'Add Management Member'}
          </h2>

          <form onSubmit={handleAddExecutive} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <input
              type="text"
              placeholder="Full Name *"
              value={executiveForm.name}
              onChange={(e) => setExecutiveForm({...executiveForm, name: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="text"
              placeholder="Position *"
              value={executiveForm.position}
              onChange={(e) => setExecutiveForm({...executiveForm, position: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="text"
              placeholder="Term (e.g., 2023-2025)"
              value={executiveForm.term}
              onChange={(e) => setExecutiveForm({...executiveForm, term: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={executiveForm.phone}
              onChange={(e) => setExecutiveForm({...executiveForm, phone: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              background: '#F8FAFC',
              borderRadius: '8px'
            }}>
              <input
                type="checkbox"
                checked={executiveForm.isActive}
                onChange={(e) => setExecutiveForm({...executiveForm, isActive: e.target.checked})}
                style={{ cursor: 'pointer' }}
              />
              <label style={{ cursor: 'pointer' }}>Currently Active</label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#1E3A8A',
                  color: 'white',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {editingExecutive ? 'Update Member' : 'Add Member'}
              </button>
              {editingExecutive && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingExecutive(null);
                    setExecutiveForm(emptyForm);
                  }}
                  style={{
                    background: '#94A3B8',
                    color: 'white',
                    padding: '12px 30px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Current Management */}
        {executives.filter(e => e.isActive).length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1E3A8A',
              marginBottom: '20px'
            }}>
              Current Management
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {executives.filter(e => e.isActive).map(executive => (
                <div key={executive.id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                  borderTop: '4px solid #10B981'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1E3A8A',
                    marginBottom: '10px'
                  }}>
                    {executive.name}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: '#10B981',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '15px'
                  }}>
                    {executive.position}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748B',
                    marginBottom: '15px'
                  }}>
                    {executive.term && <div><strong>Term:</strong> {executive.term}</div>}
                    {executive.phone && <div><strong>Phone:</strong> {executive.phone}</div>}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    paddingTop: '15px',
                    borderTop: '1px solid #EEE'
                  }}>
                    <button
                      onClick={() => handleEditExecutive(executive)}
                      style={{
                        flex: 1,
                        background: '#14B8A6',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExecutive(executive.id)}
                      style={{
                        flex: 1,
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Management */}
        {executives.filter(e => !e.isActive).length > 0 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1E3A8A',
              marginBottom: '20px'
            }}>
              Past Management
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {executives.filter(e => !e.isActive).map(executive => (
                <div key={executive.id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                  borderTop: '4px solid #CBD5E1',
                  opacity: 0.8
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1E3A8A',
                    marginBottom: '10px'
                  }}>
                    {executive.name}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: '#CBD5E1',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '15px'
                  }}>
                    {executive.position}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748B',
                    marginBottom: '15px'
                  }}>
                    {executive.term && <div><strong>Term:</strong> {executive.term}</div>}
                    {executive.phone && <div><strong>Phone:</strong> {executive.phone}</div>}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    paddingTop: '15px',
                    borderTop: '1px solid #EEE'
                  }}>
                    <button
                      onClick={() => handleDeleteExecutive(executive.id)}
                      style={{
                        flex: 1,
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {executives.length === 0 && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#94A3B8'
          }}>
            No management members added yet. Start by adding one above.
          </div>
        )}
      </div>
    </div>
  );
}
