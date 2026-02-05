import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';

import { applyToEvent, cancelEvent, getEvent, getEventApplications } from '@/api/events';
import {
  cancelApplication,
  getApplications,
  reviewAbsenceReason,
  setApplicationStatus,
} from '@/api/applications';
import { createOrganizationReview, createVolunteerReview } from '@/api/reviews';
import type { Event, VolunteerApplication } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SectionHeader } from '@/components/common/SectionHeader';

export function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [myApplication, setMyApplication] = useState<VolunteerApplication | null>(null);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewPositive, setReviewPositive] = useState('');
  const [reviewNegative, setReviewNegative] = useState('');
  const [reviewImprovement, setReviewImprovement] = useState('');
  const [volunteerReviewTarget, setVolunteerReviewTarget] = useState<VolunteerApplication | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    getEvent(eventId)
      .then(setEvent)
      .catch(() => setEvent(null));
  }, [eventId]);

  useEffect(() => {
    if (!event || !user) return;
    if (user.user_type === 'organization' && user.profile && 'id' in user.profile) {
      if (event.organization.id === user.profile.id) {
        getEventApplications(event.id).then(setApplications).catch(() => setApplications([]));
      }
    }
    if (user.user_type === 'volunteer') {
      getApplications()
        .then((data) => {
          const mine = data.find((app) => app.event.id === event.id) || null;
          setMyApplication(mine);
        })
        .catch(() => setMyApplication(null));
    }
  }, [event, user]);

  const isOrganizationOwner =
    user?.user_type === 'organization' &&
    user.profile &&
    'id' in user.profile &&
    event?.organization.id === user.profile.id;

  const canVolunteerApply =
    user?.user_type === 'volunteer' &&
    !myApplication &&
    event?.status === 'active' &&
    !!event &&
    event.approved_count < event.required_volunteers &&
    new Date(event.start_date) > new Date();

  const canVolunteerReview =
    user?.user_type === 'volunteer' &&
    myApplication?.status === 'approved' &&
    event &&
    new Date(event.end_date) < new Date();

  const handleApply = async () => {
    if (!event) return;
    try {
      setActionError(null);
      const application = await applyToEvent(event.id);
      setMyApplication(application);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Не удалось подать заявку.'
      );
    }
  };

  const handleStatusChange = async (applicationId: number, status: 'approved' | 'rejected') => {
    const updated = await setApplicationStatus(applicationId, status);
    setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleReviewAbsenceReason = async (applicationId: number, approved: boolean) => {
    const updated = await reviewAbsenceReason(applicationId, approved);
    setApplications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleVolunteerReview = async () => {
    if (!event || !volunteerReviewTarget) return;
    await createVolunteerReview({
      volunteer: volunteerReviewTarget.volunteer.id,
      event: event.id,
      rating: Number(reviewRating),
      positive_comment: reviewPositive,
      negative_comment: reviewNegative,
      improvement_comment: reviewImprovement,
    });
    setVolunteerReviewTarget(null);
    setReviewPositive('');
    setReviewNegative('');
    setReviewImprovement('');
  };

  const handleOrganizationReview = async () => {
    if (!event) return;
    await createOrganizationReview({
      organization: event.organization.id,
      event: event.id,
      rating: Number(reviewRating),
      positive_comment: reviewPositive,
      negative_comment: reviewNegative,
      improvement_comment: reviewImprovement,
    });
    setReviewPositive('');
    setReviewNegative('');
    setReviewImprovement('');
  };

  const handleCancelEvent = async () => {
    if (!event) return;
    await cancelEvent(event.id);
    setEvent({ ...event, status: 'cancelled', status_label: 'Отменено' });
  };

  const handleCancelParticipation = async () => {
    if (!myApplication) return;
    try {
      setActionError(null);
      const updated = await cancelApplication(myApplication.id);
      setMyApplication(updated);
    } catch (err: any) {
      setActionError(
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Не удалось отменить участие.'
      );
    }
  };

  const statusLabel: Record<VolunteerApplication['status'], string> = {
    pending: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    cancelled: 'Отменено волонтёром',
  };

  const stats = useMemo(() => {
    if (!event) return [];
    return [
      { label: 'Нужно волонтёров', value: event.required_volunteers },
      { label: 'Одобрено заявок', value: event.approved_count },
      { label: 'Статус', value: event.status_label || event.status },
    ];
  }, [event]);

  if (!event) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Мероприятие не найдено.
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-10">
      <SectionHeader title={event.title} subtitle={event.description} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Детали мероприятия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.start_date).toLocaleString()} — {new Date(event.end_date).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.approved_count}/{event.required_volunteers}
            </div>
            <Badge variant="muted">{event.status_label || event.status}</Badge>

            {canVolunteerApply && (
              <Button className="w-full" onClick={handleApply}>
                Подать заявку
              </Button>
            )}
            {myApplication && (
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                Ваша заявка: <strong>{statusLabel[myApplication.status]}</strong>
              </div>
            )}
            {user?.user_type === 'volunteer' && myApplication && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCancelParticipation}
                disabled={!myApplication.can_volunteer_cancel}
              >
                {myApplication.can_volunteer_cancel
                  ? 'Отменить участие'
                  : 'Отмена недоступна (меньше 24 часов)'}
              </Button>
            )}
            {actionError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {actionError}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-xs uppercase text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
          {isOrganizationOwner && (
            <Button variant="destructive" className="w-full" onClick={handleCancelEvent}>
              Отменить мероприятие
            </Button>
          )}
        </div>
      </div>

      {isOrganizationOwner && (
        <section className="space-y-4">
          <SectionHeader title="Заявки волонтёров" subtitle="Одобряйте заявки и оставляйте отзывы." />
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <p className="font-semibold">{application.volunteer.user.username}</p>
                    <p className="text-sm text-muted-foreground">Рейтинг: {application.volunteer.rating}</p>
                  </div>
                  <Badge variant="secondary">{statusLabel[application.status]}</Badge>
                  {application.absence_reason_document && (
                    <div className="space-y-2 rounded-xl border border-dashed p-3 text-sm">
                      <a
                        href={application.absence_reason_document}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Открыть документ по уважительной причине
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Статус: {application.absence_reason_approved ? 'подтверждено' : 'на проверке'}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleReviewAbsenceReason(application.id, true)}
                        >
                          Подтвердить
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReviewAbsenceReason(application.id, false)}
                        >
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusChange(application.id, 'approved')}
                    >
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                    >
                      Отклонить
                    </Button>
                    <Dialog open={volunteerReviewTarget?.id === application.id} onOpenChange={(open) => {
                      setVolunteerReviewTarget(open ? application : null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost">Отзыв</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Отзыв о волонтёре</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={reviewRating}
                            onChange={(e) => setReviewRating(e.target.value)}
                            placeholder="Оценка (1-5)"
                          />
                          <Textarea
                            value={reviewPositive}
                            onChange={(e) => setReviewPositive(e.target.value)}
                            placeholder="Что понравилось"
                          />
                          <Textarea
                            value={reviewNegative}
                            onChange={(e) => setReviewNegative(e.target.value)}
                            placeholder="Что не понравилось"
                          />
                          <Textarea
                            value={reviewImprovement}
                            onChange={(e) => setReviewImprovement(e.target.value)}
                            placeholder="Что можно улучшить"
                          />
                          <Button onClick={handleVolunteerReview}>Отправить</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {canVolunteerReview && (
        <section className="space-y-4">
          <SectionHeader title="Оставить отзыв организации" subtitle="Поделитесь впечатлениями после участия." />
          <Card>
            <CardContent className="p-6 space-y-3">
              <Input
                type="number"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                placeholder="Оценка (1-5)"
              />
              <Textarea
                value={reviewPositive}
                onChange={(e) => setReviewPositive(e.target.value)}
                placeholder="Что понравилось"
              />
              <Textarea
                value={reviewNegative}
                onChange={(e) => setReviewNegative(e.target.value)}
                placeholder="Что не понравилось"
              />
              <Textarea
                value={reviewImprovement}
                onChange={(e) => setReviewImprovement(e.target.value)}
                placeholder="Что можно улучшить"
              />
              <Button onClick={handleOrganizationReview}>Отправить отзыв</Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
