import { api } from './client';
export interface Volunteer {id: number;user: {id: number;username: string;email: string;avatar?: string;city?: string;};skills: string;experience: string;rating: number;}
export async function getVolunteers(params?: { search?: string; city?: string }) {const response = await api.get<Volunteer[]>('/volunteers/', { params });return response.data;}
export async function getVolunteer(id: number) {const response = await api.get<Volunteer>(`/volunteers/${id}/`);return response.data;}
