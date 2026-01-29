import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import { getApplications } from '@/api/applications';
import type { VolunteerApplication } from '@/api/types';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Applications() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(() => setApplications([]));
  }, []);

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Мои заявки" subtitle="История ваших откликов на мероприятия." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-5 space-y-2">
              <Badge variant="secondary">{application.status}</Badge>
              <p className="font-semibold">{application.event.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(application.event.start_date).toLocaleDateString()}
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/events/${application.event.id}`}>Открыть мероприятие</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
