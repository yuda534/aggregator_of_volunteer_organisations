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


# =====================
# USERS
# =====================
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


# =====================
# VOLUNTEERS
# =====================
class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer
    permission_classes = [IsAuthenticated, IsVolunteer]

    def perform_create(self, serializer):
        user = self.request.user

        # 1.4 — запрет двойной роли
        if Organization.objects.filter(user=user).exists():
            raise ValidationError(
                'Нельзя быть волонтёром и представителем организации одновременно'
            )

        if VolunteerProfile.objects.filter(user=user).exists():
            raise ValidationError('Профиль волонтёра уже существует')

        serializer.save(user=user)


# =====================
# ORGANIZATIONS
# =====================
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsOrganization]

    def perform_create(self, serializer):
        user = self.request.user

        # 1.4 — запрет двойной роли
        if VolunteerProfile.objects.filter(user=user).exists():
            raise ValidationError(
                'Нельзя быть волонтёром и представителем организации одновременно'
            )

        if Organization.objects.filter(user=user).exists():
            raise ValidationError('У пользователя уже есть организация')

        serializer.save(user=user)


# =====================
# EVENTS
# =====================
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


# =====================
# VOLUNTEER APPLICATIONS
# =====================
class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all()
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

        # 1.2 — запрет заявки на собственное мероприятие
        if event.organization.user == self.request.user:
            raise ValidationError('Нельзя подать заявку на собственное мероприятие')

        # 1.3 — запрет повторной заявки
        if VolunteerApplication.objects.filter(
            volunteer=volunteer_profile,
            event=event
        ).exists():
            raise ValidationError('Вы уже подали заявку на это мероприятие')

        serializer.save(volunteer=volunteer_profile)

    # ===== APPROVE =====
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        application = self.get_object()

        if application.event.organization.user != request.user:
            return Response(
                {'detail': 'Вы не можете управлять этой заявкой'},
                status=status.HTTP_403_FORBIDDEN
            )

        approved_count = VolunteerApplication.objects.filter(
            event=application.event,
            status='approved'
        ).count()

        if approved_count >= application.event.required_volunteers:
            return Response(
                {'detail': 'Набор волонтёров уже завершён'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = 'approved'
        application.save(update_fields=['status'])

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
        application.save(update_fields=['status'])

        return Response({'status': 'Заявка отклонена'})

    # ===== NO SHOW =====
    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        application = self.get_object()

        if application.event.organization.user != request.user:
            return Response(
                {'detail': 'Вы не можете управлять этой заявкой'},
                status=status.HTTP_403_FORBIDDEN
            )

        if application.status != 'approved':
            return Response(
                {'detail': 'Неявку можно отметить только для одобренной заявки'},
                status=status.HTTP_400_BAD_REQUEST
            )

        volunteer = application.volunteer
        volunteer.rating = max(volunteer.rating - 0.5, 0.0)
        volunteer.save(update_fields=['rating'])

        return Response({
            'status': 'Волонтёр не пришёл',
            'new_rating': volunteer.rating
        })


# =====================
# MAP
# =====================
def map_view(request):
    return render(
        request,
        'map.html',
        {'YANDEX_MAPS_API_KEY': settings.YANDEX_MAPS_API_KEY}
    )
