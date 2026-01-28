import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEvents } from '@/api/events';
import type { Event } from '@/api/events';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await getEvents({ status: 'active' });
      setEvents(data.slice(0, 3)); // Только 3 последних
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Объединяем волонтёров и волонтёрские организации
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Go2Help — это платформа, где волонтёры находят мероприятия,
              а организации — надёжных помощников.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/events">Найти мероприятие</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/organizations">Организации</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/volunteers">Волонтёры</Link>
                  </Button>
                </>
              ) : user?.user_type === 'volunteer' ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/events">Найти мероприятие</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/initiatives">Инициативы</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/events/create">Создать мероприятие</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/volunteers">Волонтёры</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 md:px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Возможности платформы</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Для волонтёров</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Просматривайте мероприятия, подавайте заявки,
                  создавайте инициативы, получайте отзывы.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Для организаций</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Создавайте мероприятия, отбирайте волонтёров,
                  оставляйте отзывы по итогам участия.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Прозрачность</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Рейтинги, отзывы и история участия —
                  всё для доверия между сторонами.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Последние мероприятия</h2>
            <Button asChild variant="outline">
              <Link to="/events">Все мероприятия</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : events.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{event.title}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status === 'active' ? 'Активно' : 'Завершено'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="text-sm mb-4">
                      <p className="mb-1">
                        <strong>Организация:</strong> {event.organization.name}
                      </p>
                      <p className="mb-1">
                        <strong>Дата:</strong> {new Date(event.start_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Место:</strong> {event.location}
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/events/${event.id}`}>Подробнее</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Мероприятий пока нет
            </div>
          )}
        </div>
      </section>

      {/* CTA для неавторизованных */}
      {!isAuthenticated && (
        <section className="py-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Готовы начать?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 opacity-90">
                  Зарегистрируйтесь и станьте частью волонтёрского сообщества
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/register">Регистрация</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent" size="lg">
                    <Link to="/login">Войти</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}