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
  password1: string;
  password2: string;
  user_type: 'volunteer' | 'organization';
  organization_name?: string;
  organization_address?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export async function register(data: RegisterData) {
  const response = await client.post<{ user: User; message: string }>(
    '/auth/register/',
    data
  );
  return response.data;
}

export async function login(data: LoginData) {
  const response = await client.post<{ user: User; message: string }>(
    '/auth/login/',
    data
  );
  return response.data;
}

export async function logout() {
  const response = await client.post('/auth/logout/');
  return response.data;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Получаем ID пользователя из JWT токена или другого источника
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    // Декодируем токен, чтобы получить user_id
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user_id;
    
    const response = await client.get<User>(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}