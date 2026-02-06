import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import { cancelApplication, getApplications, submitAbsenceReason } from '@/api/applications';
import type { VolunteerApplication } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCancellingId, setIsCancellingId] = useState<number | null>(null);
  const [isUploadingReasonId, setIsUploadingReasonId] = useState<number | null>(null);
  const [absenceFiles, setAbsenceFiles] = useState<Record<number, File | null>>({});

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(() => setApplications([]));
  }, []);

  const statusLabel: Record<VolunteerApplication['status'], string> = {
    pending: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    cancelled: 'Отменено волонтёром',
  };

  const handleCancel = async (applicationId: number) => {
    try {
      setError(null);
      setIsCancellingId(applicationId);
      const updated = await cancelApplication(applicationId);
      setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Не удалось отменить участие.';
      setError(message);
    } finally {
      setIsCancellingId(null);
    }
  };

  const handleAbsenceFileChange = (applicationId: number, file: File | null) => {
    setAbsenceFiles((prev) => ({ ...prev, [applicationId]: file }));
  };

  const handleSubmitAbsenceReason = async (applicationId: number) => {
    const file = absenceFiles[applicationId];
    if (!file) return;

    try {
      setError(null);
      setIsUploadingReasonId(applicationId);
      const updated = await submitAbsenceReason(applicationId, file);
      setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
      setAbsenceFiles((prev) => ({ ...prev, [applicationId]: null }));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Не удалось отправить документ.';
      setError(message);
    } finally {
      setIsUploadingReasonId(null);
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <SectionHeader title="Мои заявки" subtitle="История ваших откликов на мероприятия." />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-5 space-y-2">
              {application.status === 'cancelled' ? (
                <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                  Вы отклонили свою заявку.
                </div>
              ) : (
                !(application.status === 'pending' && new Date(application.event.end_date) < new Date()) && (
                  <Badge variant="secondary">{statusLabel[application.status]}</Badge>
                )
              )}
              <p className="font-semibold">{application.event.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(application.event.start_date).toLocaleDateString()}
              </div>
              {user?.user_type === 'volunteer' &&
                application.status !== 'cancelled' &&
                (application.status === 'pending' || application.status === 'approved') && (
                  <>
                    {application.can_volunteer_cancel ? (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleCancel(application.id)}
                        disabled={isCancellingId === application.id}
                      >
                        {isCancellingId === application.id ? 'Отмена...' : 'Отменить участие'}
                      </Button>
                    ) : (
                      <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                        До мероприятия осталось меньше 24 часов, отменить заявку невозможно.
                      </div>
                    )}
                  </>
                )}
              {user?.user_type === 'volunteer' &&
                application.status === 'approved' &&
                new Date(application.event.start_date) <= new Date() && (
                  <div className="space-y-2 rounded-xl border border-dashed p-3">
                    {application.absence_reason_document ? (
                      <p className="text-xs text-muted-foreground">
                        Документ отправлен {application.absence_reason_approved ? '(подтверждён)' : '(на проверке)'}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Если не смогли прийти, приложите подтверждающий документ.
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="text-xs"
                          onChange={(event) =>
                            handleAbsenceFileChange(application.id, event.target.files?.[0] || null)
                          }
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleSubmitAbsenceReason(application.id)}
                          disabled={!absenceFiles[application.id] || isUploadingReasonId === application.id}
                        >
                          {isUploadingReasonId === application.id ? 'Отправка...' : 'Отправить документ'}
                        </Button>
                      </>
                    )}
                  </div>
                )}
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
