import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, applyToEvent } from '@/api/events';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  location: string;
  status: string;
  organization: {
    id: number;
    name: string;
  };
}

export default function MyApplications() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);

  useEffect(() => {
    if (user?.user_type === 'volunteer') {
      fetchEvents();
    }
  }, [user]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await getEvents({ status: 'active' });
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(eventId: number) {
    if (!user) return;
    
    try {
      setApplying(eventId);
      await applyToEvent(eventId);
      alert('Заявка успешно отправлена!');
      fetchEvents(); // Обновляем список
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка подачи заявки');
    } finally {
      setApplying(null);
    }
  }

  if (user?.user_type !== 'volunteer') {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-4">Доступ только для волонтёров</h2>
        <p>Эта страница доступна только для пользователей с типом "волонтёр"</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Мои заявки</h1>
      
      {events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Нет доступных мероприятий для подачи заявки</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <strong>Организация:</strong> {event.organization.name}
                  </div>
                  <div className="text-sm">
                    <strong>Дата:</strong> {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <strong>Место:</strong> {event.location}
                  </div>
                  <div className="text-sm">
                    <strong>Статус:</strong> {event.status === 'active' ? 'Активно' : 'Завершено'}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleApply(event.id)}
                  disabled={applying === event.id}
                  className="w-full"
                >
                  {applying === event.id ? 'Подача заявки...' : 'Подать заявку'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}