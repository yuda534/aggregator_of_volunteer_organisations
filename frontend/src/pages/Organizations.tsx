import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { getOrganizations } from '@/api/organizations';
import type { OrganizationDetail } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Organizations() {
  const [organizations, setOrganizations] = useState<OrganizationDetail[]>([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    getOrganizations({ search, city })
      .then(setOrganizations)
      .catch(() => setOrganizations([]));
  }, [search, city]);

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Организации" subtitle="Найдите проверенную организацию и свяжитесь с ней." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по названию или описанию"
            className="pl-11"
          />
        </div>
        <Input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Город"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <Badge variant="muted">Рейтинг: {org.rating}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{org.description?.slice(0, 140) || 'Описание не заполнено.'}</p>
              <Button asChild className="w-full">
                <Link to={`/organizations/${org.id}`}>Подробнее</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
