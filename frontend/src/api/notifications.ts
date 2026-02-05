import api from './client';
import type { NotificationItem } from './types';

export async function getNotifications(status?: 'unread' | 'read') {
  const response = await api.get<NotificationItem[]>('/notifications/', {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function markNotificationRead(id: number) {
  const response = await api.post<NotificationItem>(`/notifications/${id}/read/`);
  return response.data;
}

