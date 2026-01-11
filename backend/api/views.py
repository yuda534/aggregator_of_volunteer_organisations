from django.conf import settings
from django.shortcuts import render, get_object_or_404

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication
)

from .serializers import (
    UserSerializer,
    VolunteerProfileSerializer,
    OrganizationSerializer,
    EventSerializer,
    VolunteerApplicationSerializer
)

from .permissions import IsOrganization, IsVolunteer


# ======================================================
# DRF API (ViewSets)
# ======================================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer
    permission_classes = [IsAuthenticated, IsVolunteer]

    def perform_create(self, serializer):
        user = self.request.user

        if Organization.objects.filter(user=user).exists():
            raise ValidationError(
                'Нельзя быть волонтёром и представителем организации одновременно'
            )

        if VolunteerProfile.objects.filter(user=user).exists():
            raise ValidationError('Профиль волонтёра уже существует')

        serializer.save(user=user)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsOrganization]

    def perform_create(self, serializer):
        user = self.request.user

        if VolunteerProfile.objects.filter(user=user).exists():
            raise ValidationError(
                'Нельзя быть волонтёром и представителем организации одновременно'
            )

        if Organization.objects.filter(user=user).exists():
            raise ValidationError('У пользователя уже есть организация')

        serializer.save(user=user)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOrganization()]
        return [AllowAny()]

    def perform_create(self, serializer):
        try:
            organization = Organization.objects.get(user=self.request.user)
        except Organization.DoesNotExist:
            raise ValidationError('У пользователя нет организации')

        serializer.save(organization=organization)


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = VolunteerApplicationSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return VolunteerApplication.objects.none()

        if user.user_type == 'volunteer':
            return VolunteerApplication.objects.filter(
                volunteer__user=user
            )

        if user.user_type == 'organization':
            return VolunteerApplication.objects.filter(
                event__organization__user=user
            )

        return VolunteerApplication.objects.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsVolunteer()]
        if self.action in ['approve', 'reject', 'no_show']:
            return [IsAuthenticated(), IsOrganization()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        try:
            volunteer_profile = VolunteerProfile.objects.get(user=self.request.user)
        except VolunteerProfile.DoesNotExist:
            raise ValidationError('Создайте профиль волонтёра перед подачей заявки')

        event = serializer.validated_data['event']

        if event.organization.user == self.request.user:
            raise ValidationError('Нельзя подать заявку на собственное мероприятие')

        if VolunteerApplication.objects.filter(
            volunteer=volunteer_profile,
            event=event
        ).exists():
            raise ValidationError('Вы уже подали заявку на это мероприятие')

        serializer.save(volunteer=volunteer_profile)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        application = self.get_object()

        if application.event.organization.user != request.user:
            return Response(
                {'detail': 'Нет доступа'},
                status=status.HTTP_403_FORBIDDEN
            )

        application.status = 'approved'
        application.save(update_fields=['status'])
        return Response({'status': 'Одобрено'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected'
        application.save(update_fields=['status'])
        return Response({'status': 'Отклонено'})


# ======================================================
# HTML PAGES (НЕ API)
# ======================================================

def home(request):
    return render(request, 'pages/home.html')


def event_list_view(request):
    events = Event.objects.filter(status='active').order_by('start_date')
    return render(request, 'pages/event_list.html', {'events': events})


def event_detail_view(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    return render(request, 'pages/event_detail.html', {'event': event})


def organization_list(request):
    organizations = Organization.objects.all()
    return render(request, 'organization_list.html', {'organizations': organizations})


def organization_detail(request, pk):
    organization = get_object_or_404(Organization, pk=pk)
    return render(request, 'organization_detail.html', {'organization': organization})


def volunteer_list(request):
    volunteers = VolunteerProfile.objects.select_related('user')
    return render(request, 'volunteer_list.html', {'volunteers': volunteers})


def volunteer_detail(request, pk):
    volunteer = get_object_or_404(
        VolunteerProfile.objects.select_related('user'),
        pk=pk
    )
    return render(request, 'volunteer_detail.html', {'volunteer': volunteer})


def application_list(request):
    user = request.user

    if not user.is_authenticated:
        applications = []
    elif user.user_type == 'volunteer':
        applications = VolunteerApplication.objects.filter(
            volunteer__user=user
        )
    elif user.user_type == 'organization':
        applications = VolunteerApplication.objects.filter(
            event__organization__user=user
        )
    else:
        applications = []

    return render(request, 'application_list.html', {'applications': applications})


def application_detail(request, pk):
    application = get_object_or_404(VolunteerApplication, pk=pk)
    return render(request, 'application_detail.html', {'application': application})


def map_view(request):
    return render(
        request,
        'map.html',
        {'YANDEX_MAPS_API_KEY': settings.YANDEX_MAPS_API_KEY}
    )
