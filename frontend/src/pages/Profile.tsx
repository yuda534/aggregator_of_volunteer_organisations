import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AvatarPreview } from '@/components/common/AvatarPreview';
import { cn } from '@/lib/utils';

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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const initialFormRef = useRef<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  useEffect(() => {
    if (!user) return;
    const snapshot = {
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
    };
    setFormState(snapshot);
    initialFormRef.current = snapshot;
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
    setSaveMessage(null);
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
    const currentValues: Record<string, string> = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
    };
    if (user.user_type === 'volunteer') {
      currentValues.skills = 'skills' in (user.profile || {}) ? (user.profile?.skills as string) || '' : '';
      currentValues.experience =
        'experience' in (user.profile || {}) ? (user.profile?.experience as string) || '' : '';
    }
    if (user.user_type === 'organization') {
      currentValues.name = 'name' in (user.profile || {}) ? (user.profile?.name as string) || '' : '';
      currentValues.description =
        'description' in (user.profile || {}) ? (user.profile?.description as string) || '' : '';
      currentValues.website =
        'website' in (user.profile || {}) ? (user.profile?.website as string) || '' : '';
      currentValues.contact_email =
        'contact_email' in (user.profile || {}) ? (user.profile?.contact_email as string) || '' : '';
      currentValues.address =
        'address' in (user.profile || {}) ? (user.profile?.address as string) || '' : '';
    }

    const isFormChanged = Object.keys(currentValues).some(
      (key) => (formState[key] ?? '') !== (currentValues[key] ?? '')
    );
    const hasFileChanges = Boolean(avatarFile || logoFile);
    if (!isFormChanged && !hasFileChanges) {
      setSaveMessage('Никаких изменений не было');
      return;
    }

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
    setAvatarFile(null);
    setLogoFile(null);
    initialFormRef.current = { ...formState };
    setSaveMessage('Изменения сохранены');
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

  const handleInitiativeCancel = async (initiative: Initiative) => {
    const updated = await updateInitiative(initiative.id, { status: 'cancelled' });
    setInitiatives((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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

  const ratingValue = useMemo(() => {
    if (!user || !user.profile) return 0;
    return 'rating' in user.profile ? Number(user.profile.rating || 0) : 0;
  }, [user]);

  const reviewsCount = useMemo(() => {
    if (!user) return 0;
    return user.user_type === 'volunteer' ? volunteerReviews.length : organizationReviews.length;
  }, [user, volunteerReviews.length, organizationReviews.length]);

  const isDirty = useMemo(() => {
    const initial = initialFormRef.current;
    const changed = Object.keys(initial).some(
      (key) => (formState[key] ?? '') !== (initial[key] ?? '')
    );
    return changed || Boolean(avatarFile || logoFile);
  }, [formState, avatarFile, logoFile]);

  const isFieldDirty = (field: string) =>
    (formState[field] ?? '') !== (initialFormRef.current[field] ?? '');

  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const avatarSrc = useMemo(() => {
    if (!user) return undefined;
    if (user.user_type === 'organization') {
      return user.profile && 'logo' in user.profile ? user.profile.logo || undefined : undefined;
    }
    return user.avatar || undefined;
  }, [user]);

  const avatarFallback = useMemo(() => {
    if (!user) return '';
    if (user.user_type === 'organization') {
      const name = user.profile && 'name' in user.profile ? user.profile.name || '' : '';
      return (name || user.username).slice(0, 2).toUpperCase();
    }
    const name = user.first_name || user.username;
    return name.slice(0, 2).toUpperCase();
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
      <div className="flex flex-wrap items-center gap-3">
        <AvatarPreview
          src={avatarSrc}
          alt={user.username}
          fallback={avatarFallback}
          title={user.user_type === 'organization' ? 'Логотип организации' : 'Аватар волонтёра'}
          className="h-12 w-12"
        />
        <div>
          <SectionHeader title={title} subtitle={`Пользователь: ${user.username}`} />
        </div>
      </div>

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

        <TabsContent value="profile" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Рейтинг: {ratingValue}</Badge>
            <Badge variant="muted">Отзывы: {reviewsCount}</Badge>
          </div>
          {isDirty && (
            <Alert className="border-primary/30 bg-primary/10 text-foreground">
              <AlertDescription>Есть не сохранённые изменения.</AlertDescription>
            </Alert>
          )}
          {saveMessage && (
            <Alert>
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Данные профиля</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 min-w-0">
              <Input
                value={formState.first_name || ''}
                onChange={(event) => handleChange('first_name', event.target.value)}
                placeholder="Имя"
                className={cn(
                  'w-full max-w-full',
                  isFieldDirty('first_name') && 'border-primary/50 ring-1 ring-primary/30'
                )}
              />
              <Input
                value={formState.last_name || ''}
                onChange={(event) => handleChange('last_name', event.target.value)}
                placeholder="Фамилия"
                className={cn(
                  'w-full max-w-full',
                  isFieldDirty('last_name') && 'border-primary/50 ring-1 ring-primary/30'
                )}
              />
              <Input
                value={formState.phone || ''}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="Телефон"
                className={cn(
                  'w-full max-w-full',
                  isFieldDirty('phone') && 'border-primary/50 ring-1 ring-primary/30'
                )}
              />
              <Input
                value={formState.city || ''}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Город"
                className={cn(
                  'w-full max-w-full',
                  isFieldDirty('city') && 'border-primary/50 ring-1 ring-primary/30'
                )}
              />
              <Textarea
                value={formState.bio || ''}
                onChange={(event) => handleChange('bio', event.target.value)}
                placeholder="О себе"
                className={cn(
                  'md:col-span-2 w-full max-w-full',
                  isFieldDirty('bio') && 'border-primary/50 ring-1 ring-primary/30'
                )}
              />

              {user.user_type === 'volunteer' && (
                <>
                  <Input
                    value={formState.skills || ''}
                    onChange={(event) => handleChange('skills', event.target.value)}
                    placeholder="Навыки"
                    className={cn(
                      'w-full max-w-full',
                      isFieldDirty('skills') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <Input
                    value={formState.experience || ''}
                    onChange={(event) => handleChange('experience', event.target.value)}
                    placeholder="Опыт"
                    className={cn(
                      'w-full max-w-full',
                      isFieldDirty('experience') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Аватар волонтёра</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        id="volunteer-avatar"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          setAvatarFile(event.target.files?.[0] || null);
                          setSaveMessage(null);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="volunteer-avatar"
                        className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer w-fit"
                      >
                        Выберите файл
                      </label>
                      <span className="text-sm text-muted-foreground pl-2 sm:pl-0">
                        {avatarFile ? avatarFile.name : 'Файл не выбран'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {user.user_type === 'organization' && (
                <>
                  <Input
                    value={formState.name || ''}
                    onChange={(event) => handleChange('name', event.target.value)}
                    placeholder="Название организации"
                    className={cn(
                      'w-full max-w-full',
                      isFieldDirty('name') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <Input
                    value={formState.website || ''}
                    onChange={(event) => handleChange('website', event.target.value)}
                    placeholder="Сайт"
                    className={cn(
                      'w-full max-w-full',
                      isFieldDirty('website') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <Input
                    value={formState.contact_email || ''}
                    onChange={(event) => handleChange('contact_email', event.target.value)}
                    placeholder="Почта для связи"
                    className={cn(
                      'w-full max-w-full',
                      isFieldDirty('contact_email') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <Input
                    value={formState.address || ''}
                    onChange={(event) => handleChange('address', event.target.value)}
                    placeholder="Адрес"
                    className={cn(
                      'md:col-span-2 w-full max-w-full',
                      isFieldDirty('address') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <Textarea
                    value={formState.description || ''}
                    onChange={(event) => handleChange('description', event.target.value)}
                    placeholder="Описание"
                    className={cn(
                      'md:col-span-2 w-full max-w-full',
                      isFieldDirty('description') && 'border-primary/50 ring-1 ring-primary/30'
                    )}
                  />
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Логотип организации</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        id="organization-logo"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          setLogoFile(event.target.files?.[0] || null);
                          setSaveMessage(null);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="organization-logo"
                        className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer w-fit"
                      >
                        Выберите файл
                      </label>
                      <span className="text-sm text-muted-foreground pl-2 sm:pl-0">
                        {logoFile ? logoFile.name : 'Файл не выбран'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleSave} className="md:col-span-2 w-full max-w-full">
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
                  {!(application.status === 'pending' && new Date(application.event.end_date) < new Date()) && (
                    <Badge variant="secondary">{applicationStatusLabel[application.status]}</Badge>
                  )}
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
                      <div className="flex flex-wrap gap-2">
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
                        {initiative.status !== 'cancelled' && (
                          <Button
                            variant="secondary"
                            onClick={() => handleInitiativeCancel(initiative)}
                          >
                            Отменить
                          </Button>
                        )}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
