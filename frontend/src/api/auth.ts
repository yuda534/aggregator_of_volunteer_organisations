import api from './client';
import type { MeResponse, UserType } from './types';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  user_type: UserType;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  bio?: string;
  avatar?: File | null;
  skills?: string;
  experience?: string;
  date_of_birth?: string | null;
  name?: string;
  description?: string;
  website?: string;
  contact_email?: string;
  address?: string;
  logo?: File | null;
}

export interface AuthResponse {
  user: MeResponse;
  access: string;
  refresh: string;
}

export async function login(username: string, password: string) {
  const response = await api.post('/auth/token/', { username, password });
  return response.data as { access: string; refresh: string };
}

export async function register(payload: RegisterPayload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await api.post<AuthResponse>('/auth/register/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get<MeResponse>('/auth/me/');
  return response.data;
}

export async function updateMe(payload: Record<string, unknown>) {
  const response = await api.patch<MeResponse>('/auth/me/', payload);
  return response.data;
}
