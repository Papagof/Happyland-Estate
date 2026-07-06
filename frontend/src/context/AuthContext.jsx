import { useState } from 'react';
import { authApi, getToken, setToken, clearToken } from '../api/client';
import { AuthContext } from './auth-context';

const USER_KEY = 'happyland_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored && getToken() ? JSON.parse(stored) : null;
  });

  const login = async (username, password) => {
    const { token, user: loggedInUser } = await authApi.login(username, password);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
