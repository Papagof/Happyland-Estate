const API_BASE = '/api';
const TOKEN_KEY = 'happyland_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const authApi = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
};

export const usersApi = {
  list: () => request('/users'),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (id, password) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ password }) }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

export const residentsApi = {
  list: () => request('/residents'),
  count: () => request('/residents/count'),
  create: (data) => request('/residents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/residents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/residents/${id}`, { method: 'DELETE' })
};

export const executivesApi = {
  list: () => request('/executives'),
  activeCount: () => request('/executives/active-count'),
  activeList: () => request('/executives/active'),
  inactiveList: () => request('/executives/inactive'),
  create: (data) => request('/executives', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/executives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/executives/${id}`, { method: 'DELETE' })
};

export const propertiesApi = {
  list: () => request('/properties'),
  create: (data) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/properties/${id}`, { method: 'DELETE' })
};

export const paymentsApi = {
  list: () => request('/payments'),
  create: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) })
};

export const contactApi = {
  create: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) })
};
