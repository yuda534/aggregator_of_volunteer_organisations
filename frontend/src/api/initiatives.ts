import api from './client';
import type { Initiative } from './types';

export interface InitiativePayload {
  title: string;
  description: string;
  status?: string;
}

export async function getInitiatives() {
  const response = await api.get<Initiative[]>('/initiatives/');
  return response.data;
}

export async function createInitiative(payload: InitiativePayload) {
  const response = await api.post<Initiative>('/initiatives/', payload);
  return response.data;
}
