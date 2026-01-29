import { useEffect, useState } from 'react';

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

  useEffect(() => {
    getInitiatives()
      .then(setInitiatives)
      .catch(() => setInitiatives([]));
  }, []);

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
        {initiatives.map((initiative) => (
          <Card key={initiative.id}>
            <CardHeader>
              <CardTitle>{initiative.title}</CardTitle>
              <Badge variant="secondary">{initiative.status}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {initiative.description.slice(0, 160)}...
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
