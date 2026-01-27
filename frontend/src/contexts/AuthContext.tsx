import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api/client';
interface User {id: number;username: string;email: string;user_type: 'volunteer' | 'organization';avatar?: string;city?: string;}
interface AuthContextType {user: User | null;isLoading: boolean;login: (username: string, password: string) => Promise<void>;register: (data: any) => Promise<void>;logout: () => void;}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {checkAuth();}, []);
  const checkAuth = async () => {const token = localStorage.getItem('access_token');if (token) {try {const response = await api.get('/users/me/');setUser(response.data);} catch {localStorage.removeItem('access_token');localStorage.removeItem('refresh_token');}} setIsLoading(false);};
  const login = async (username: string, password: string) => {const response = await api.post('/token/', { username, password });localStorage.setItem('access_token', response.data.access);localStorage.setItem('refresh_token', response.data.refresh);const userResponse = await api.get('/users/me/');setUser(userResponse.data);};
  const register = async (data: any) => {await api.post('/users/', data);await login(data.username, data.password);};
  const logout = () => {localStorage.removeItem('access_token');localStorage.removeItem('refresh_token');setUser(null);window.location.href = '/';};
  return (<AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>);
};
export const useAuth = () => {const context = useContext(AuthContext);if (!context) throw new Error('useAuth must be used within AuthProvider');return context;};
