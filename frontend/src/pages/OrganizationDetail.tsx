import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Globe, Mail, MapPin } from 'lucide-react';

import { getOrganization } from '@/api/organizations';
import { getEvents } from '@/api/events';
import { getOrganizationReviews } from '@/api/reviews';
import type { Event, OrganizationDetail as OrgDetail, OrganizationReview } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function OrganizationDetail() {
  const { id } = useParams();
  const orgId = Number(id);
  const [organization, setOrganization] = useState<OrgDetail | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<OrganizationReview[]>([]);

  useEffect(() => {
    if (!orgId) return;
    getOrganization(orgId)
      .then(setOrganization)
      .catch(() => setOrganization(null));
    getEvents({ organization: orgId })
      .then(setEvents)
      .catch(() => setEvents([]));
    getOrganizationReviews({ organization: orgId })
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [orgId]);

  if (!organization) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Организация не найдена.
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-10">
      <SectionHeader title={organization.name} subtitle={organization.description} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={organization.logo || undefined} alt={organization.name} />
                <AvatarFallback>{organization.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              Информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Рейтинг: {organization.rating}</Badge>
              <Badge variant="muted">Отзывы: {organization.reviews_count ?? reviews.length}</Badge>
              {organization.is_verified && <Badge variant="success">Проверено</Badge>}
            </div>
            {organization.website && (
              <p className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> {organization.website}
              </p>
            )}
            {organization.contact_email && (
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {organization.contact_email}
              </p>
            )}
            {organization.address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {organization.address}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/60">
          <CardHeader>
            <CardTitle>Контакты пользователя</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Ответственный: {organization.user?.username}</p>
            {organization.user?.city && <p>Город: {organization.user.city}</p>}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Мероприятия организации" subtitle="Список активных и прошедших событий." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <Badge variant="muted">{event.status_label || event.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{event.description.slice(0, 120)}...</p>
                <Button asChild className="w-full">
                  <Link to={`/events/${event.id}`}>Открыть</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Отзывы" subtitle="Что говорят волонтёры об организации." />
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет отзывов.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5 space-y-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">Оценка: {review.rating}</Badge>
                  {review.event_details && (
                    <p>Мероприятие: {review.event_details.title}</p>
                  )}
                  {review.positive_comment && <p>Что понравилось: {review.positive_comment}</p>}
                  {review.negative_comment && <p>Что не понравилось: {review.negative_comment}</p>}
                  {review.improvement_comment && (
                    <p>Что можно улучшить: {review.improvement_comment}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
