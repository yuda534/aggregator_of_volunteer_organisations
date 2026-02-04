from django.core.management.base import BaseCommand

from api.services.no_show import process_no_show_applications


class Command(BaseCommand):
    help = 'Автоматически выставляет 1* за no-show без подтверждённой причины.'

    def handle(self, *args, **options):
        processed = process_no_show_applications()
        self.stdout.write(
            self.style.SUCCESS(f'Обработано заявок: {processed}')
        )

