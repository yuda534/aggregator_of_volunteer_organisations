from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import (
    CustomUser,
    Event,
    Organization,
    VolunteerApplication,
    VolunteerProfile,
    VolunteerReview,
)
from api.services.no_show import process_no_show_applications


class ApplicationFlowTests(APITestCase):
    def setUp(self):
        self.organization_user = CustomUser.objects.create_user(
            username='org',
            email='org@example.com',
            password='Password123!',
            user_type='organization',
        )
        self.organization = Organization.objects.create(
            user=self.organization_user,
            name='Helping Hands',
        )

        self.volunteer_user = CustomUser.objects.create_user(
            username='vol',
            email='vol@example.com',
            password='Password123!',
            user_type='volunteer',
        )
        self.volunteer = VolunteerProfile.objects.create(user=self.volunteer_user)

    def test_volunteer_can_cancel_application_more_than_24_hours_before_start(self):
        event = Event.objects.create(
            organization=self.organization,
            title='Future Event',
            description='desc',
            start_date=timezone.now() + timedelta(days=2),
            end_date=timezone.now() + timedelta(days=2, hours=2),
            location='Moscow',
            required_volunteers=5,
            status='active',
        )
        application = VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=event,
            status='approved',
        )

        self.client.force_authenticate(user=self.volunteer_user)
        response = self.client.post(f'/api/v1/applications/{application.id}/cancel/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status, 'cancelled')
        self.assertIsNotNone(application.cancelled_at)

    def test_volunteer_cannot_cancel_application_within_24_hours(self):
        event = Event.objects.create(
            organization=self.organization,
            title='Soon Event',
            description='desc',
            start_date=timezone.now() + timedelta(hours=10),
            end_date=timezone.now() + timedelta(hours=12),
            location='Moscow',
            required_volunteers=5,
            status='active',
        )
        application = VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=event,
            status='approved',
        )

        self.client.force_authenticate(user=self.volunteer_user)
        response = self.client.post(f'/api/v1/applications/{application.id}/cancel/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        application.refresh_from_db()
        self.assertEqual(application.status, 'approved')

    def test_map_endpoint_returns_only_future_events_with_free_slots(self):
        target_event = Event.objects.create(
            organization=self.organization,
            title='Open Future',
            description='desc',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=3),
            location='Moscow',
            required_volunteers=3,
            status='active',
            latitude=55.7,
            longitude=37.6,
        )
        VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=target_event,
            status='approved',
        )

        full_event = Event.objects.create(
            organization=self.organization,
            title='Full Future',
            description='desc',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            location='Moscow',
            required_volunteers=1,
            status='active',
            latitude=55.8,
            longitude=37.7,
        )
        VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=full_event,
            status='approved',
        )

        Event.objects.create(
            organization=self.organization,
            title='Past Event',
            description='desc',
            start_date=timezone.now() - timedelta(days=2),
            end_date=timezone.now() - timedelta(days=1),
            location='Moscow',
            required_volunteers=10,
            status='active',
            latitude=55.9,
            longitude=37.8,
        )

        response = self.client.get('/api/v1/events/map/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event_ids = {item['id'] for item in response.data}
        self.assertIn(target_event.id, event_ids)
        self.assertNotIn(full_event.id, event_ids)


class NoShowAutomationTests(APITestCase):
    def setUp(self):
        self.organization_user = CustomUser.objects.create_user(
            username='org2',
            email='org2@example.com',
            password='Password123!',
            user_type='organization',
        )
        self.organization = Organization.objects.create(
            user=self.organization_user,
            name='Org Two',
        )

        self.volunteer_user = CustomUser.objects.create_user(
            username='vol2',
            email='vol2@example.com',
            password='Password123!',
            user_type='volunteer',
        )
        self.volunteer = VolunteerProfile.objects.create(user=self.volunteer_user)

        self.past_event = Event.objects.create(
            organization=self.organization,
            title='Past',
            description='desc',
            start_date=timezone.now() - timedelta(days=2),
            end_date=timezone.now() - timedelta(days=1),
            location='Moscow',
            required_volunteers=10,
            status='active',
        )

    def test_no_show_without_excuse_creates_auto_review_with_one_star(self):
        application = VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=self.past_event,
            status='approved',
        )

        processed = process_no_show_applications()
        application.refresh_from_db()

        self.assertEqual(processed, 1)
        self.assertTrue(application.no_show_marked)
        review = VolunteerReview.objects.get(
            volunteer=self.volunteer,
            organization=self.organization,
            event=self.past_event,
        )
        self.assertEqual(review.rating, 1)

    def test_confirmed_absence_reason_skips_auto_review(self):
        application = VolunteerApplication.objects.create(
            volunteer=self.volunteer,
            event=self.past_event,
            status='approved',
            absence_reason_document=SimpleUploadedFile('reason.pdf', b'dummy'),
            absence_reason_approved=True,
        )

        processed = process_no_show_applications()
        application.refresh_from_db()

        self.assertEqual(processed, 1)
        self.assertTrue(application.no_show_marked)
        self.assertFalse(
            VolunteerReview.objects.filter(
                volunteer=self.volunteer,
                organization=self.organization,
                event=self.past_event,
            ).exists()
        )
