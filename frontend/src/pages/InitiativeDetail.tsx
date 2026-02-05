import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getInitiative } from '@/api/initiatives';
import type { Initiative } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function InitiativeDetail() {
  const { id } = useParams();
  const initiativeId = Number(id);
  const [initiative, setInitiative] = useState<Initiative | null>(null);

  useEffect(() => {
    if (!initiativeId) return;
    getInitiative(initiativeId)
      .then((data) => setInitiative(data))
      .catch(() => setInitiative(null));
  }, [initiativeId]);

  if (!initiative || initiative.status === 'cancelled') {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Инициатива не найдена или отменена.
      </div>
    );
  }

  const authorInfo = initiative.volunteer?.user;
  const authorName =
    [authorInfo?.first_name, authorInfo?.last_name].filter(Boolean).join(' ').trim() ||
    authorInfo?.username ||
    '';
  const subtitle = authorName ? `Инициатива волонтёра ${authorName}` : 'Инициатива волонтёра';

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title={initiative.title} subtitle={subtitle} />
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Описание</span>
            <Badge variant="secondary">{initiative.status_label || initiative.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{initiative.description}</p>
          <p className="text-xs text-muted-foreground">Автор: {authorName || 'Волонтёр'}</p>
          <div className="text-xs text-muted-foreground">
            Дата создания: {new Date(initiative.created_at).toLocaleDateString('ru-RU')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
