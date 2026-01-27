import { api } from './client';
export interface Organization {id: number;name: string;description: string;rating: number;user: {id: number;username: string;city?: string;};}
export async function getOrganizations(params?: { search?: string; city?: string }) {const response = await api.get<Organization[]>('/organizations/', { params });return response.data;}
export async function getOrganization(id: number) {const response = await api.get<Organization>(`/organizations/${id}/`);return response.data;}
