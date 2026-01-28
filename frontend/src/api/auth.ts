import client from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'volunteer' | 'organization';
  phone?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  is_verified: boolean;
  created_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  user_type: 'volunteer' | 'organization';
  organization_name?: string;
  organization_address?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: User;
}

export async function register(data: RegisterData): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/register/', data);
  const { access, refresh, user } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  return { access, refresh, user };
}

export async function login(data: LoginData): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/api/token/', data);
  const { access, refresh, user } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  return { access, refresh, user };
}

export async function logout(): Promise<void> {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await client.get<User>('/users/me/');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}