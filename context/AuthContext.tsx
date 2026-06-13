'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Modifiez Promise<void> par Promise<User>
  login: (username: string, password: string) => Promise<User>; 
  logout: () => void;
  isAuthenticated: boolean;
}


const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) fetchProfile();
    else setLoading(false);
  }, []);

  const fetchProfile = async (): Promise<User> => {
  try {
    const { data } = await api.get(endpoints.auth.profile);
    setUser(data);
    return data;           // ← ajout clé
  } catch {
    localStorage.clear();
    throw new Error('Profile fetch failed');
  } finally {
    setLoading(false);
  }
};

const login = async (username: string, password: string): Promise<User> => {
  const { data } = await api.post(endpoints.auth.login, { username, password });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return await fetchProfile();   // ← return ajouté
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
