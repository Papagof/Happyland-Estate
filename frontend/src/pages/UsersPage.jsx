import { useState, useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { usersApi } from '../api/client';
import { useAuth } from '../context/useAuth';

const emptyForm = { username: '', password: '', role: 'authorized' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.list().then(setUsers);
  }, []);

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
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div style={{
      background: '#F8FAFC',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1E3A8A',
          marginBottom: '30px'
        }}>
          Authorized User Accounts
        </h1>

        {/* Form Section */}
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
            Add New User
          </h2>

          <form onSubmit={handleCreate} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <input
              type="text"
              placeholder="Username *"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="authorized">Authorized</option>
              <option value="admin">Admin</option>
            </select>

            <div style={{ gridColumn: '1 / -1' }}>
              {error && (
                <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '15px' }}>
                  {error}
                </div>
              )}
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
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={16} /> Add User
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {users.map(u => (
              <div key={u.id} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                borderLeft: `4px solid ${u.role === 'admin' ? '#1E3A8A' : '#14B8A6'}`
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1E3A8A',
                  marginBottom: '8px'
                }}>
                  {u.username}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: u.role === 'admin' ? '#1E3A8A' : '#14B8A6',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}>
                  {u.role.toUpperCase()}
                </div>

                {u.id !== currentUser.id && (
                  <div style={{
                    display: 'flex',
                    paddingTop: '15px',
                    borderTop: '1px solid #EEE'
                  }}>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{
                        flex: 1,
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {users.length === 0 && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#94A3B8'
          }}>
            No authorized users yet. Start by adding one above.
          </div>
        )}
      </div>
    </div>
  );
}
