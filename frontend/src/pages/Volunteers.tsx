import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { getVolunteers } from '@/api/volunteers';
import type { VolunteerDetail } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Volunteers() {
  const [volunteers, setVolunteers] = useState<VolunteerDetail[]>([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    getVolunteers({ search, city })
      .then(setVolunteers)
      .catch(() => setVolunteers([]));
  }, [search, city]);

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Волонтёры" subtitle="Познакомьтесь с волонтёрским сообществом." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по навыкам или имени"
            className="pl-11"
          />
        </div>
        <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Город" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {volunteers.map((volunteer) => (
          <Card key={volunteer.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={volunteer.user.avatar || undefined} alt={volunteer.user.username} />
                  <AvatarFallback>
                    {(volunteer.user.first_name || volunteer.user.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {volunteer.user.username}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="muted">Рейтинг: {volunteer.rating}</Badge>
                <Badge variant="secondary">Отзывы: {volunteer.reviews_count ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{volunteer.skills || 'Навыки пока не заполнены.'}</p>
              <Button asChild className="w-full">
                <Link to={`/volunteers/${volunteer.id}`}>Профиль</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
