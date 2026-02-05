import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { createInitiative, getInitiatives } from '@/api/initiatives';
import type { Initiative } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function Initiatives() {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const getVolunteerName = (initiative: Initiative) => {
    const userInfo = initiative.volunteer?.user;
    const fullName = [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(' ').trim();
    return fullName || userInfo?.username || 'Волонтёр';
  };

  useEffect(() => {
    getInitiatives()
      .then(setInitiatives)
      .catch(() => setInitiatives([]));
  }, []);

  const visibleInitiatives = useMemo(
    () => initiatives.filter((initiative) => initiative.status !== 'cancelled'),
    [initiatives]
  );

  const handleCreate = async () => {
    if (!title || !description) return;
    const newInitiative = await createInitiative({ title, description, status: 'published' });
    setInitiatives((prev) => [newInitiative, ...prev]);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="container py-12 space-y-10">
      <SectionHeader title="Инициативы" subtitle="Идеи и проекты волонтёров." />

      {user?.user_type === 'volunteer' && (
        <Card>
          <CardHeader>
            <CardTitle>Новая инициатива</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название"
            />
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Описание"
            />
            <Button onClick={handleCreate}>Опубликовать</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleInitiatives.map((initiative) => (
          <Card key={initiative.id}>
            <CardHeader>
              <CardTitle>{initiative.title}</CardTitle>
              <Badge variant="secondary">{initiative.status_label || initiative.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{initiative.description.slice(0, 160)}...</p>
              <p className="text-xs text-muted-foreground">
                Автор: {getVolunteerName(initiative)}
              </p>
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to={`/initiatives/${initiative.id}`}>Подробнее</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
