import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Pengguna } from '../types';
import { apiFetch, getAuthToken, setAuthToken } from '../lib/api';

interface AuthContextType {
  user: Pengguna | null;
  isLoading: boolean;
  login: (data: { user: Pengguna; token?: string }) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Pengguna | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (!token && !useMocks) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch<{ data: Pengguna }>('/api/auth/me');
      setUser(res.data);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (payload: { user: Pengguna; token?: string }) => {
    if (payload.token) {
      setAuthToken(payload.token);
    }
    setUser(payload.user);
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
