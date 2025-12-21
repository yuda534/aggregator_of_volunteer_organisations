from rest_framework import viewsets
from django.conf import settings
from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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


# ===== USERS =====
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


# ===== VOLUNTEERS =====
class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer

    # === ИСПРАВЛЕНИЕ НАЧАЛО ===
    def perform_create(self, serializer):
        if VolunteerProfile.objects.filter(user=self.request.user).exists():
            raise ValidationError('Профиль волонтёра уже существует')

        serializer.save(user=self.request.user)
    # === ИСПРАВЛЕНИЕ КОНЕЦ ===


# ===== ORGANIZATIONS =====
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    # === ИСПРАВЛЕНИЕ НАЧАЛО ===
    def perform_create(self, serializer):
        if Organization.objects.filter(user=self.request.user).exists():
            raise ValidationError('У пользователя уже есть организация')

        serializer.save(user=self.request.user)
    # === ИСПРАВЛЕНИЕ КОНЕЦ ===


# ===== EVENTS =====
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOrganization()]
        return [AllowAny()]

    # === ИСПРАВЛЕНИЕ НАЧАЛО ===
    def perform_create(self, serializer):
        try:
            organization = Organization.objects.get(user=self.request.user)
        except Organization.DoesNotExist:
            raise ValidationError('У пользователя нет организации')

        serializer.save(organization=organization)
    # === ИСПРАВЛЕНИЕ КОНЕЦ ===


# ===== VOLUNTEER APPLICATIONS =====
class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationSerializer


    # === ШАГ 3: ФИЛЬТРАЦИЯ ЗАЯВОК ===
    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return VolunteerApplication.objects.none()

        # волонтёр — только свои заявки
        if user.user_type == 'volunteer':
            return VolunteerApplication.objects.filter(
                volunteer__user=user
            )

        # организация — заявки на свои события
        if user.user_type == 'organization':
            return VolunteerApplication.objects.filter(
                event__organization__user=user
            )

        return VolunteerApplication.objects.none()
    # === КОНЕЦ ШАГА 3 ===

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsVolunteer()]
        if self.action in ['approve', 'reject']:
            return [IsAuthenticated(), IsOrganization()]
        return [IsAuthenticated()]

    # === ИСПРАВЛЕНИЕ НАЧАЛО ===
    def perform_create(self, serializer):
        try:
            volunteer_profile = VolunteerProfile.objects.get(user=self.request.user)
        except VolunteerProfile.DoesNotExist:
            raise ValidationError('Создайте профиль волонтёра перед подачей заявки')

        event = serializer.validated_data.get('event')

        if VolunteerApplication.objects.filter(
            volunteer=volunteer_profile,
            event=event
        ).exists():
            raise ValidationError('Вы уже подали заявку на это мероприятие')

        serializer.save(volunteer=volunteer_profile)
    # === ИСПРАВЛЕНИЕ КОНЕЦ ===

    # ===== APPROVE =====
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        application = self.get_object()

        if application.event.organization.user != request.user:
            return Response(
                {'detail': 'Вы не можете управлять этой заявкой'},
                status=status.HTTP_403_FORBIDDEN
            )

        application.status = 'approved'
        application.save()

        return Response({'status': 'Заявка одобрена'})

    # ===== REJECT =====
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()

        if application.event.organization.user != request.user:
            return Response(
                {'detail': 'Вы не можете управлять этой заявкой'},
                status=status.HTTP_403_FORBIDDEN
            )

        application.status = 'rejected'
        application.save()

        return Response({'status': 'Заявка отклонена'})


# ===== MAP =====
def map_view(request):
    return render(
        request,
        'map.html',
        {'YANDEX_MAPS_API_KEY': settings.YANDEX_MAPS_API_KEY}
    )
