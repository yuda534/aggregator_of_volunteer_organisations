import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';

import { getEvents } from '@/api/events';
import { getInitiatives } from '@/api/initiatives';
import type { Event, Initiative } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/common/SectionHeader';

export function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  useEffect(() => {
    getEvents({ status: 'active' })
      .then((data) => setEvents(data.slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    getInitiatives()
      .then((data) => setInitiatives(data.slice(0, 3)))
      .catch(() => setInitiatives([]));
  }, []);

  return (
    <div>
      <section className="hero-grid">
        <div className="container py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
                Соединяем волонтёров и организации
              </Badge>
              <h1 className="text-4xl font-display font-semibold leading-tight md:text-5xl">
                Делайте добрые дела вместе — быстро находите события и команды рядом.
              </h1>
              <p className="text-lg text-muted-foreground">
                Платформа помогает организациям собирать команды, а волонтёрам — находить
                значимые мероприятия и инициативы в своём городе.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/events">
                    Смотреть события <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/organizations">Найти организацию</Link>
                </Button>
                {user && (
                  <Button variant="secondary" asChild size="lg">
                    <Link to="/notifications">Уведомления</Link>
                  </Button>
                )}
              </div>
            </div>
            <Card className="border-none bg-background/80 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" /> Быстрый старт
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>Создайте профиль волонтёра или организации, чтобы управлять заявками.</p>
                <p>Публикуйте мероприятия, получайте отклики и оставляйте отзывы.</p>
                <p>Используйте карту, чтобы видеть события рядом с вами.</p>
                {user?.user_type === 'organization' && (
                  <Button asChild className="w-full">
                    <Link to="/create-event">Создать мероприятие</Link>
                  </Button>
                )}
                {user?.user_type === 'volunteer' && (
                  <Button asChild className="w-full" variant="secondary">
                    <Link to="/initiatives">Добавить инициативу</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16 space-y-8">
        <SectionHeader title="Актуальные мероприятия" subtitle="Найдите ближайшее событие и присоединяйтесь." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <Badge variant="muted">{event.status_label || event.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{event.description.slice(0, 120)}...</p>
                <div className="flex items-center gap-2 text-xs">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(event.start_date).toLocaleDateString()}
                </div>
                <Button asChild className="mt-2 w-full">
                  <Link to={`/events/${event.id}`}>Подробнее</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container py-12 md:py-16 space-y-8">
          <SectionHeader
            title="Инициативы волонтёров"
            subtitle="Личные проекты, которые можно поддержать или масштабировать."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((initiative) => (
              <Card key={initiative.id}>
                <CardHeader>
                  <CardTitle>{initiative.title}</CardTitle>
                  <Badge variant="secondary">{initiative.status_label || initiative.status}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {initiative.description.slice(0, 140)}...
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
