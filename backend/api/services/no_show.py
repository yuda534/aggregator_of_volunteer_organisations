from django.db import transaction
from django.utils import timezone

from api.models import VolunteerApplication, VolunteerReview


AUTO_NO_SHOW_COMMENT = (
    "Автоматическая оценка: волонтёр не явился на мероприятие "
    "и не предоставил подтверждённую уважительную причину."
)


def process_no_show_applications(now=None):
    """
    Автоматически выставляет 1 звезду за no-show без подтверждённой причины.
    Возвращает количество обработанных заявок.
    """
    current_time = now or timezone.now()
    queryset = VolunteerApplication.objects.select_related(
        'volunteer',
        'event',
        'event__organization',
    ).filter(
        status='approved',
        no_show_marked=False,
        event__end_date__lt=current_time,
    )

    processed = 0
    for application in queryset:
        has_confirmed_reason = (
            bool(application.absence_reason_document)
            and application.absence_reason_approved
        )

        existing_review = VolunteerReview.objects.filter(
            volunteer=application.volunteer,
            organization=application.event.organization,
            event=application.event,
        ).exists()

        with transaction.atomic():
            if not has_confirmed_reason and not existing_review:
                VolunteerReview.objects.get_or_create(
                    volunteer=application.volunteer,
                    organization=application.event.organization,
                    event=application.event,
                    defaults={
                        'rating': 1,
                        'positive_comment': '',
                        'negative_comment': AUTO_NO_SHOW_COMMENT,
                    },
                )

            application.no_show_marked = True
            application.save(update_fields=['no_show_marked'])
            processed += 1

    return processed

