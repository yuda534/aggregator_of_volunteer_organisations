import client from './client';

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  required_volunteers: number;
  status: string;
  latitude?: number;
  longitude?: number;
  organization: {
    id: number;
    name: string;
    rating: number;
  };
  approved_count: number;
}

export interface EventFilters {
  status?: string;
  search?: string;
}

export async function getEvents(filters: EventFilters = {}) {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const response = await client.get<Event[]>(`/events/?${params}`);
  return response.data;
}

export async function getEvent(id: number): Promise<Event> {
  const response = await client.get<Event>(`/events/${id}/`);
  return response.data;
}

export async function createEvent(data: Partial<Event>) {
  const response = await client.post<Event>('/events/create/', data);
  return response.data;
}

export async function applyToEvent(eventId: number) {
  const response = await client.post(`/events/${eventId}/apply/`);
  return response.data;
}

export async function getMapEvents() {
  const response = await client.get<Event[]>('/map/events/');
  return response.data;
}