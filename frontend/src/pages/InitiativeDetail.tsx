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

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title={initiative.title} subtitle="Инициатива волонтёра" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Описание</span>
            <Badge variant="secondary">{initiative.status_label || initiative.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{initiative.description}</p>
          <div className="text-xs text-muted-foreground">
            Дата создания: {new Date(initiative.created_at).toLocaleDateString('ru-RU')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
