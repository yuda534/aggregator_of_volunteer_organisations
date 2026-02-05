import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import { getApplications } from '@/api/applications';
import { getEvents } from '@/api/events';
import { deleteInitiative, getInitiatives, updateInitiative } from '@/api/initiatives';
import { getNotifications, markNotificationRead } from '@/api/notifications';
import { getOrganizationReviews, getVolunteerReviews } from '@/api/reviews';
import type {
  Event,
  Initiative,
  NotificationItem,
  OrganizationReview,
  VolunteerApplication,
  VolunteerReview,
} from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [initiativeForm, setInitiativeForm] = useState({ title: '', description: '', status: 'draft' });
  const [volunteerReviews, setVolunteerReviews] = useState<VolunteerReview[]>([]);
  const [organizationReviews, setOrganizationReviews] = useState<OrganizationReview[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationItem[]>([]);
  const [readNotifications, setReadNotifications] = useState<NotificationItem[]>([]);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

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
    setActiveTab(searchParams.get('tab') || 'profile');
  }, [searchParams]);

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

    if (user.user_type === 'volunteer' && user.profile && 'id' in user.profile) {
      getInitiatives({ volunteer: user.profile.id })
        .then(setInitiatives)
        .catch(() => setInitiatives([]));
    }

    if (user.profile && 'id' in user.profile) {
      if (user.user_type === 'volunteer') {
        getVolunteerReviews({ volunteer: user.profile.id })
          .then(setVolunteerReviews)
          .catch(() => setVolunteerReviews([]));
      }
      if (user.user_type === 'organization') {
        getOrganizationReviews({ organization: user.profile.id })
          .then(setOrganizationReviews)
          .catch(() => setOrganizationReviews([]));
      }
    }

    getNotifications('unread')
      .then(setUnreadNotifications)
      .catch(() => setUnreadNotifications([]));
    getNotifications('read')
      .then(setReadNotifications)
      .catch(() => setReadNotifications([]));
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    const payload: Record<string, unknown> = {
      first_name: formState.first_name || '',
      last_name: formState.last_name || '',
      phone: formState.phone || '',
      city: formState.city || '',
      bio: formState.bio || '',
    };
    if (user.user_type === 'volunteer') {
      payload.skills = formState.skills || '';
      payload.experience = formState.experience || '';
      if (avatarFile) {
        payload.avatar = avatarFile;
      }
    }
    if (user.user_type === 'organization') {
      payload.name = formState.name || '';
      payload.description = formState.description || '';
      payload.website = formState.website || '';
      payload.contact_email = formState.contact_email || '';
      payload.address = formState.address || '';
      if (logoFile) {
        payload.logo = logoFile;
      }
    }
    await updateProfile(payload);
  };

  const applicationStatusLabel: Record<VolunteerApplication['status'], string> = {
    pending: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    cancelled: 'Отменено волонтёром',
  };

  const initiativeStatusOptions = [
    { value: 'draft', label: 'Черновик' },
    { value: 'published', label: 'Опубликовано' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Завершено' },
    { value: 'cancelled', label: 'Отменено' },
  ];

  const openInitiativeEdit = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setInitiativeForm({
      title: initiative.title,
      description: initiative.description,
      status: initiative.status,
    });
  };

  const handleInitiativeUpdate = async () => {
    if (!editingInitiative) return;
    const updated = await updateInitiative(editingInitiative.id, {
      title: initiativeForm.title,
      description: initiativeForm.description,
      status: initiativeForm.status,
    });
    setInitiatives((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setEditingInitiative(null);
  };

  const handleInitiativeDelete = async (initiativeId: number) => {
    await deleteInitiative(initiativeId);
    setInitiatives((prev) => prev.filter((item) => item.id !== initiativeId));
  };

  const handleNotificationRead = async (notification: NotificationItem, goToDetails = false) => {
    const updated = await markNotificationRead(notification.id);
    setUnreadNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    setReadNotifications((prev) => [updated, ...prev.filter((item) => item.id !== updated.id)]);
    if (goToDetails && updated.link) {
      navigate(updated.link);
    }
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          {user.user_type === 'volunteer' && <TabsTrigger value="initiatives">Инициативы</TabsTrigger>}
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="read_notifications">Прочитанные уведомления</TabsTrigger>
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
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Аватар волонтёра</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
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
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Логотип организации</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
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
                  <Badge variant="secondary">{applicationStatusLabel[application.status]}</Badge>
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

        {user.user_type === 'volunteer' && (
          <TabsContent value="initiatives">
            {initiatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">У вас пока нет инициатив.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {initiatives.map((initiative) => (
                  <Card key={initiative.id}>
                    <CardContent className="p-5 space-y-2">
                      <Badge variant="secondary">{initiative.status_label || initiative.status}</Badge>
                      <p className="font-semibold">{initiative.title}</p>
                      <p className="text-sm text-muted-foreground">{initiative.description}</p>
                      <div className="flex gap-2">
                        <Dialog
                          open={editingInitiative?.id === initiative.id}
                          onOpenChange={(open) => (open ? openInitiativeEdit(initiative) : setEditingInitiative(null))}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline">Редактировать</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать инициативу</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                value={initiativeForm.title}
                                onChange={(event) =>
                                  setInitiativeForm((prev) => ({ ...prev, title: event.target.value }))
                                }
                                placeholder="Название"
                              />
                              <Textarea
                                value={initiativeForm.description}
                                onChange={(event) =>
                                  setInitiativeForm((prev) => ({ ...prev, description: event.target.value }))
                                }
                                placeholder="Описание"
                              />
                              <Select
                                value={initiativeForm.status}
                                onValueChange={(value) =>
                                  setInitiativeForm((prev) => ({ ...prev, status: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                  {initiativeStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={handleInitiativeUpdate}>Сохранить</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          onClick={() => handleInitiativeDelete(initiative.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="reviews">
          {(user.user_type === 'volunteer' ? volunteerReviews : organizationReviews).length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет отзывов.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(user.user_type === 'volunteer' ? volunteerReviews : organizationReviews).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5 space-y-2">
                    <Badge variant="secondary">Оценка: {review.rating}</Badge>
                    {review.event_details && (
                      <p className="text-sm text-muted-foreground">
                        Мероприятие: {review.event_details.title}
                      </p>
                    )}
                    {review.positive_comment && <p>Что понравилось: {review.positive_comment}</p>}
                    {review.negative_comment && <p>Что не понравилось: {review.negative_comment}</p>}
                    {review.improvement_comment && (
                      <p>Что можно улучшить: {review.improvement_comment}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {unreadNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Новых уведомлений нет.</p>
          ) : (
            <div className="grid gap-4">
              {unreadNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-5 space-y-2">
                    <p className="font-semibold">{notification.title}</p>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('ru-RU')}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="secondary" onClick={() => handleNotificationRead(notification, true)}>
                        Подробнее
                      </Button>
                      <Button variant="outline" onClick={() => handleNotificationRead(notification, false)}>
                        Прочитано
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="read_notifications">
          {readNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Прочитанных уведомлений нет.</p>
          ) : (
            <div className="grid gap-4">
              {readNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-5 space-y-2">
                    <p className="font-semibold">{notification.title}</p>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('ru-RU')}
                    </div>
                    {notification.link && (
                      <Button variant="outline" onClick={() => navigate(notification.link!)}>
                        Подробнее
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
