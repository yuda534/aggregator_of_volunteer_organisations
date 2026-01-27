import { api } from './client';
export interface Event {id: number;title: string;description: string;start_date: string;end_date: string;location: string;required_volunteers: number;status: string;organization: {id: number;name: string;rating: number;};approved_count: number;latitude?: number;longitude?: number;}
export async function getEvents(params?: {search?: string;status?: string;start_date?: string;}) {const response = await api.get<Event[]>('/events/', { params });return response.data;}
export async function getEvent(id: number) {const response = await api.get<Event>(`/events/${id}/`);return response.data;}
export async function applyToEvent(eventId: number) {const response = await api.post(`/events/${eventId}/apply/`);return response.data;}
export async function createEvent(data: Partial<Event>) {const response = await api.post<Event>('/events/', data);return response.data;}
