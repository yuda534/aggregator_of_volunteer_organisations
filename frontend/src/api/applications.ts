import api from './client';
import type { VolunteerApplication } from './types';

export async function getApplications() {
  const response = await api.get<VolunteerApplication[]>('/applications/');
  return response.data;
}

export async function setApplicationStatus(id: number, status: 'approved' | 'rejected') {
  const response = await api.post<VolunteerApplication>(`/applications/${id}/set_status/`, { status });
  return response.data;
}
