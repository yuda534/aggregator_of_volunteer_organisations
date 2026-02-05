import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MailPlus, Star, XCircle } from 'lucide-react';

import { getNotifications, markNotificationRead } from '@/api/notifications';
import type { NotificationItem } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const notificationConfig: Record<
  string,
  { label: string; icon: typeof MailPlus; badge: 'muted' | 'secondary' | 'success' | 'warning' }
> = {
  application_created: { label: 'Новая заявка', icon: MailPlus, badge: 'secondary' },
  application_approved: { label: 'Одобрено', icon: CheckCircle2, badge: 'success' },
  application_rejected: { label: 'Отклонено', icon: XCircle, badge: 'warning' },
  review_received: { label: 'Новый отзыв', icon: Star, badge: 'muted' },
};

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const groupedNotifications = useMemo(() => {
    const today = new Date();
    const isToday = (date: Date) =>
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const groups: { title: string; items: NotificationItem[] }[] = [];
    const todayItems = notifications.filter((item) => isToday(new Date(item.created_at)));
    const otherItems = notifications.filter((item) => !isToday(new Date(item.created_at)));

    if (todayItems.length) groups.push({ title: 'Сегодня', items: todayItems });
    if (otherItems.length) groups.push({ title: 'Ранее', items: otherItems });
    return groups;
  }, [notifications]);

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

  const handleReadAll = async () => {
    if (notifications.length === 0) return;
    try {
      setIsMarkingAll(true);
      await Promise.all(notifications.map((item) => markNotificationRead(item.id)));
      setNotifications([]);
    } catch {
      setError('Не удалось отметить все уведомления как прочитанные.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Уведомления" subtitle="Новые события и действия по вашим заявкам." />
        {notifications.length > 0 && (
          <Button variant="outline" onClick={handleReadAll} disabled={isMarkingAll}>
            {isMarkingAll ? 'Отмечаем...' : 'Прочитано всё'}
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока нет новых уведомлений. Прочитанные сообщения доступны в профиле.
        </p>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              <div className="grid gap-4">
                {group.items.map((notification) => {
                  const config = notificationConfig[notification.notification_type] || {
                    label: 'Уведомление',
                    icon: MailPlus,
                    badge: 'muted',
                  };
                  const Icon = config.icon;
                  return (
                    <Card key={notification.id}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </span>
                            <div className="space-y-1">
                              <p className="font-semibold">{notification.title}</p>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant={config.badge}>{config.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{new Date(notification.created_at).toLocaleString('ru-RU')}</span>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              variant="secondary"
                              onClick={() => handleRead(notification, true)}
                            >
                              Подробнее
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRead(notification, false)}
                            >
                              Прочитано
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
