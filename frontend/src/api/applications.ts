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

export async function cancelApplication(id: number) {
  const response = await api.post<VolunteerApplication>(`/applications/${id}/cancel/`);
  return response.data;
}

export async function submitAbsenceReason(id: number, document: File, comment = '') {
  const formData = new FormData();
  formData.append('document', document);
  if (comment) {
    formData.append('comment', comment);
  }
  const response = await api.post<VolunteerApplication>(`/applications/${id}/absence-reason/`, formData);
  return response.data;
}

export async function reviewAbsenceReason(id: number, approved: boolean) {
  const response = await api.post<VolunteerApplication>(`/applications/${id}/review-absence/`, {
    approved,
  });
  return response.data;
}
