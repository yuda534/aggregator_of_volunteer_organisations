import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, TokenResponse } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    }
    setLoading(false);
  }

  async function login(data: { username: string; password: string }) {
    const { user } = await apiLogin(data);
    setUser(user);
  }

  async function register(data: any) {
    const { user } = await apiRegister(data);
    setUser(user);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}