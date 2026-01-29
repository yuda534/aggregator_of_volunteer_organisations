import api from './client';
import type { Event, VolunteerApplication } from './types';

export interface EventFilters {
  status?: string;
  search?: string;
  organization?: number;
}

export interface EventCreatePayload {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  required_volunteers: number;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getEvents(filters: EventFilters = {}) {
  const response = await api.get<Event[]>('/events/', { params: filters });
  return response.data;
}

export async function getEvent(id: number) {
  const response = await api.get<Event>(`/events/${id}/`);
  return response.data;
}

export async function createEvent(payload: EventCreatePayload) {
  const response = await api.post<Event>('/events/', payload);
  return response.data;
}

export async function applyToEvent(id: number) {
  const response = await api.post<VolunteerApplication>(`/events/${id}/apply/`);
  return response.data;
}

export async function cancelEvent(id: number) {
  const response = await api.post(`/events/${id}/cancel/`);
  return response.data;
}

export async function getEventApplications(id: number) {
  const response = await api.get<VolunteerApplication[]>(`/events/${id}/applications/`);
  return response.data;
}

export async function getMapEvents() {
  const response = await api.get<Event[]>('/events/map/');
  return response.data;
}
