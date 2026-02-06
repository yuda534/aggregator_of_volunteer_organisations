import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getVolunteer } from '@/api/volunteers';
import { getVolunteerReviews } from '@/api/reviews';
import type { VolunteerDetail as VolunteerDetailType, VolunteerReview } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function VolunteerDetail() {
  const { id } = useParams();
  const volunteerId = Number(id);
  const [volunteer, setVolunteer] = useState<VolunteerDetailType | null>(null);
  const [reviews, setReviews] = useState<VolunteerReview[]>([]);

  useEffect(() => {
    if (!volunteerId) return;
    getVolunteer(volunteerId)
      .then(setVolunteer)
      .catch(() => setVolunteer(null));
    getVolunteerReviews({ volunteer: volunteerId })
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [volunteerId]);

  if (!volunteer) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Волонтёр не найден.
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title={volunteer.user.username} subtitle="Профиль волонтёра" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={volunteer.user.avatar || undefined} alt={volunteer.user.username} />
                <AvatarFallback>
                  {(volunteer.user.first_name || volunteer.user.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              О волонтёре
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Рейтинг: {volunteer.rating}</Badge>
              <Badge variant="muted">Отзывы: {volunteer.reviews_count ?? reviews.length}</Badge>
            </div>
            <p>Навыки: {volunteer.skills || 'Нет данных'}</p>
            <p>Опыт: {volunteer.experience || 'Нет данных'}</p>
            {volunteer.user.city && <p>Город: {volunteer.user.city}</p>}
          </CardContent>
        </Card>
        <Card className="bg-muted/60">
          <CardHeader>
            <CardTitle>Контакты</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Пользователь: {volunteer.user.username}</p>
            <p>Тип: Волонтёр</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <SectionHeader title="Отзывы" subtitle="Мнения организаций о работе волонтёра." />
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
