import api from './client';
import type { VolunteerDetail } from './types';

export async function getVolunteers(params?: { search?: string; city?: string }) {
  const response = await api.get<VolunteerDetail[]>('/volunteers/', { params });
  return response.data;
}

export async function getVolunteer(id: number) {
  const response = await api.get<VolunteerDetail>(`/volunteers/${id}/`);
  return response.data;
}
