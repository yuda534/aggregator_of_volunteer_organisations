import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import { getApplications } from '@/api/applications';
import { getEvents } from '@/api/events';
import type { Event, VolunteerApplication } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [formState, setFormState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setFormState({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      skills: 'skills' in (user.profile || {}) ? (user.profile?.skills as string) || '' : '',
      experience: 'experience' in (user.profile || {}) ? (user.profile?.experience as string) || '' : '',
      name: 'name' in (user.profile || {}) ? (user.profile?.name as string) || '' : '',
      description: 'description' in (user.profile || {}) ? (user.profile?.description as string) || '' : '',
      website: 'website' in (user.profile || {}) ? (user.profile?.website as string) || '' : '',
      contact_email: 'contact_email' in (user.profile || {}) ? (user.profile?.contact_email as string) || '' : '',
      address: 'address' in (user.profile || {}) ? (user.profile?.address as string) || '' : '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getApplications()
      .then(setApplications)
      .catch(() => setApplications([]));

    if (user.user_type === 'organization' && user.profile && 'id' in user.profile) {
      getEvents({ organization: user.profile.id })
        .then(setEvents)
        .catch(() => setEvents([]));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    const payload: Record<string, string> = {
      first_name: formState.first_name || '',
      last_name: formState.last_name || '',
      phone: formState.phone || '',
      city: formState.city || '',
      bio: formState.bio || '',
    };
    if (user.user_type === 'volunteer') {
      payload.skills = formState.skills || '';
      payload.experience = formState.experience || '';
    }
    if (user.user_type === 'organization') {
      payload.name = formState.name || '';
      payload.description = formState.description || '';
      payload.website = formState.website || '';
      payload.contact_email = formState.contact_email || '';
      payload.address = formState.address || '';
    }
    await updateProfile(payload);
  };

  const title = useMemo(() => {
    if (!user) return 'Профиль';
    return user.user_type === 'organization' ? 'Профиль организации' : 'Профиль волонтёра';
  }, [user]);

  if (!user) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Нужно войти в систему.
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title={title} subtitle={`Пользователь: ${user.username}`} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          {user.user_type === 'organization' && <TabsTrigger value="events">Мероприятия</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Данные профиля</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input
                value={formState.first_name || ''}
                onChange={(event) => handleChange('first_name', event.target.value)}
                placeholder="Имя"
              />
              <Input
                value={formState.last_name || ''}
                onChange={(event) => handleChange('last_name', event.target.value)}
                placeholder="Фамилия"
              />
              <Input
                value={formState.phone || ''}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="Телефон"
              />
              <Input
                value={formState.city || ''}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Город"
              />
              <Textarea
                value={formState.bio || ''}
                onChange={(event) => handleChange('bio', event.target.value)}
                placeholder="О себе"
                className="md:col-span-2"
              />

              {user.user_type === 'volunteer' && (
                <>
                  <Input
                    value={formState.skills || ''}
                    onChange={(event) => handleChange('skills', event.target.value)}
                    placeholder="Навыки"
                  />
                  <Input
                    value={formState.experience || ''}
                    onChange={(event) => handleChange('experience', event.target.value)}
                    placeholder="Опыт"
                  />
                </>
              )}

              {user.user_type === 'organization' && (
                <>
                  <Input
                    value={formState.name || ''}
                    onChange={(event) => handleChange('name', event.target.value)}
                    placeholder="Название организации"
                  />
                  <Input
                    value={formState.website || ''}
                    onChange={(event) => handleChange('website', event.target.value)}
                    placeholder="Сайт"
                  />
                  <Input
                    value={formState.contact_email || ''}
                    onChange={(event) => handleChange('contact_email', event.target.value)}
                    placeholder="Email для связи"
                  />
                  <Input
                    value={formState.address || ''}
                    onChange={(event) => handleChange('address', event.target.value)}
                    placeholder="Адрес"
                    className="md:col-span-2"
                  />
                  <Textarea
                    value={formState.description || ''}
                    onChange={(event) => handleChange('description', event.target.value)}
                    placeholder="Описание"
                    className="md:col-span-2"
                  />
                </>
              )}

              <Button onClick={handleSave} className="md:col-span-2">
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <div className="grid gap-4 md:grid-cols-2">
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
        </TabsContent>

        {user.user_type === 'organization' && (
          <TabsContent value="events">
            <div className="flex items-center justify-between">
              <SectionHeader title="Ваши мероприятия" subtitle="Создавайте и управляйте событиями." />
              <Button asChild>
                <Link to="/create-event">Создать мероприятие</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-5 space-y-2">
                    <Badge variant="muted">{event.status_label || event.status}</Badge>
                    <p className="font-semibold">{event.title}</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/events/${event.id}`}>Открыть</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
