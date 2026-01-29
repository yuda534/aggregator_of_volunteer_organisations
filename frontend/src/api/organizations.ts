import api from './client';
import type { OrganizationDetail } from './types';

export async function getOrganizations(params?: { search?: string; city?: string }) {
  const response = await api.get<OrganizationDetail[]>('/organizations/', { params });
  return response.data;
}

export async function getOrganization(id: number) {
  const response = await api.get<OrganizationDetail>(`/organizations/${id}/`);
  return response.data;
}
