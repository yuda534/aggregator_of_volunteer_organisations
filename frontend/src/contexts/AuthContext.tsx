import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
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
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(data: { username: string; password: string }) {
    const response = await apiLogin(data);
    
    // В реальном приложении здесь будет JWT токен
    // localStorage.setItem('access_token', response.access);
    // localStorage.setItem('refresh_token', response.refresh);
    
    setUser(response.user);
  }

  async function logout() {
    await apiLogout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
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