import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search } from 'lucide-react';

import { getEvents } from '@/api/events';
import type { Event } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/common/SectionHeader';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('active');

  useEffect(() => {
    const filters: { search?: string; status?: string } = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    getEvents(filters)
      .then(setEvents)
      .catch(() => setEvents([]));
  }, [search, status]);

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Мероприятия" subtitle="Фильтруйте события и подавайте заявки." />

      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по названию, описанию, локации"
            className="pl-11"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="completed">Завершённые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <Badge variant="muted">{event.status_label || event.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{event.description.slice(0, 140)}...</p>
              <p className="text-xs text-muted-foreground">
                Организация: {event.organization.name}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-4 w-4" />
                {new Date(event.start_date).toLocaleString()}
              </div>
              <Button asChild className="w-full">
                <Link to={`/events/${event.id}`}>Открыть событие</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
