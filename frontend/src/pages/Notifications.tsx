import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getNotifications, markNotificationRead } from '@/api/notifications';
import type { NotificationItem } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotifications('unread')
      .then(setNotifications)
      .catch(() => setError('Не удалось загрузить уведомления.'));
  }, []);

  const handleRead = async (notification: NotificationItem, goToDetails = false) => {
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      if (goToDetails && notification.link) {
        navigate(notification.link);
      }
    } catch {
      setError('Не удалось обновить уведомление.');
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Уведомления" subtitle="Новые события и действия по вашим заявкам." />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет новых уведомлений.</p>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-5 space-y-2">
                <p className="font-semibold">{notification.title}</p>
                {notification.message && (
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString('ru-RU')}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary" onClick={() => handleRead(notification, true)}>
                    Подробнее
                  </Button>
                  <Button variant="outline" onClick={() => handleRead(notification, false)}>
                    Прочитано
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

