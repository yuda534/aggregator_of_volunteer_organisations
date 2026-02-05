import api from './client';
import type { Initiative } from './types';

export interface InitiativePayload {
  title: string;
  description: string;
  status?: string;
}

export async function getInitiatives(filters: { volunteer?: number } = {}) {
  const response = await api.get<Initiative[]>('/initiatives/', { params: filters });
  return response.data;
}

export async function getInitiative(id: number) {
  const response = await api.get<Initiative>(`/initiatives/${id}/`);
  return response.data;
}

export async function createInitiative(payload: InitiativePayload) {
  const response = await api.post<Initiative>('/initiatives/', payload);
  return response.data;
}

export async function updateInitiative(id: number, payload: InitiativePayload) {
  const response = await api.patch<Initiative>(`/initiatives/${id}/`, payload);
  return response.data;
}

export async function deleteInitiative(id: number) {
  await api.delete(`/initiatives/${id}/`);
}
