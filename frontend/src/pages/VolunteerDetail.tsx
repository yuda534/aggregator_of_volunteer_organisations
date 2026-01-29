import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getVolunteer } from '@/api/volunteers';
import type { VolunteerDetail as VolunteerDetailType } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VolunteerDetail() {
  const { id } = useParams();
  const volunteerId = Number(id);
  const [volunteer, setVolunteer] = useState<VolunteerDetailType | null>(null);

  useEffect(() => {
    if (!volunteerId) return;
    getVolunteer(volunteerId)
      .then(setVolunteer)
      .catch(() => setVolunteer(null));
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
            <CardTitle>О волонтёре</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Badge variant="secondary">Рейтинг: {volunteer.rating}</Badge>
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
            <p>Тип: {volunteer.user.user_type}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
