from django.db.models import Count, Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Event,
    Initiative,
    Organization,
    VolunteerApplication,
    VolunteerProfile,
)
from .permissions import IsOrganization, IsVolunteer
from .serializers import (
    EventCreateUpdateSerializer,
    EventSerializer,
    InitiativeSerializer,
    MeSerializer,
    OrganizationSerializer,
    OrganizationReviewSerializer,
    RegisterSerializer,
    VolunteerApplicationSerializer,
    VolunteerProfileSerializer,
    VolunteerReviewSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': MeSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get(self, request):
        return Response(MeSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data

        user_fields = {
            'first_name',
            'last_name',
            'email',
            'phone',
            'avatar',
            'bio',
            'city',
        }

        profile_data = data.get('profile') if isinstance(data, dict) else None
        if not isinstance(profile_data, dict):
            profile_data = {}

        for field in user_fields:
            if field in data:
                setattr(user, field, data[field])
        user.save()

        if user.user_type == 'volunteer':
            profile, _ = VolunteerProfile.objects.get_or_create(user=user)
            profile_fields = {
                'skills',
                'experience',
                'date_of_birth',
                'is_active',
            }
            for field in profile_fields:
                if field in data:
                    setattr(profile, field, data[field])
                if field in profile_data:
                    setattr(profile, field, profile_data[field])
            profile.save()
        elif user.user_type == 'organization':
            organization, _ = Organization.objects.get_or_create(user=user, defaults={'name': user.username})
            profile_fields = {
                'name',
                'description',
                'logo',
                'website',
                'contact_email',
                'address',
            }
            for field in profile_fields:
                if field in data:
                    setattr(organization, field, data[field])
                if field in profile_data:
                    setattr(organization, field, profile_data[field])
            organization.save()

        return Response(MeSerializer(user).data)


class EventViewSet(viewsets.ModelViewSet):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'cancel', 'applications']:
            return [IsOrganization()]
        if self.action in ['apply']:
            return [IsVolunteer()]
        if self.action in ['list', 'retrieve', 'map']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Event.objects.select_related('organization').annotate(
            approved_count=Count(
                'volunteerapplication',
                filter=Q(volunteerapplication__status='approved'),
            )
        )

        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        org_id = self.request.query_params.get('organization')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(location__icontains=search)
                | Q(organization__name__icontains=search)
            )

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if org_id:
            queryset = queryset.filter(organization_id=org_id)

        return queryset.order_by('-start_date')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventSerializer

    def perform_create(self, serializer):
        organization = Organization.objects.filter(user=self.request.user).first()
        if not organization:
            raise ValidationError('Организация не найдена.')
        serializer.save(organization=organization)

    def perform_update(self, serializer):
        event = self.get_object()
        if event.organization.user != self.request.user:
            raise PermissionDenied('Можно редактировать только свои мероприятия.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.organization.user != self.request.user:
            raise PermissionDenied('Можно удалять только свои мероприятия.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        event = self.get_object()
        volunteer = VolunteerProfile.objects.filter(user=request.user).first()
        if not volunteer:
            raise ValidationError('Профиль волонтёра не найден.')
        if not event.is_open_for_applications():
            raise ValidationError('Набор на мероприятие закрыт.')

        application, created = VolunteerApplication.objects.get_or_create(
            volunteer=volunteer,
            event=event,
        )
        if not created:
            raise ValidationError('Заявка уже существует.')

        return Response(
            VolunteerApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        event = self.get_object()
        if event.organization.user != request.user:
            raise PermissionDenied('Нельзя отменять чужое мероприятие.')
        if event.status in ['completed', 'cancelled']:
            raise ValidationError('Мероприятие уже завершено или отменено.')

        event.status = 'cancelled'
        event.save(update_fields=['status'])

        VolunteerApplication.objects.filter(event=event).exclude(status='rejected').update(status='rejected')
        return Response({'status': 'cancelled'})

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        event = self.get_object()
        if event.organization.user != request.user:
            raise PermissionDenied('Нельзя смотреть заявки чужого мероприятия.')
        applications = VolunteerApplication.objects.filter(event=event).select_related('volunteer__user', 'event')
        return Response(VolunteerApplicationSerializer(applications, many=True).data)

    @action(detail=False, methods=['get'], url_path='map')
    def map(self, request):
        queryset = self.get_queryset().filter(latitude__isnull=False, longitude__isnull=False)
        return Response(EventSerializer(queryset, many=True).data)


class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organization.objects.select_related('user')
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        city = self.request.query_params.get('city')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(user__username__icontains=search)
            )
        if city:
            queryset = queryset.filter(user__city__icontains=city)
        return queryset.order_by('name')


class VolunteerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VolunteerProfile.objects.select_related('user')
    serializer_class = VolunteerProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        city = self.request.query_params.get('city')
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(skills__icontains=search)
            )
        if city:
            queryset = queryset.filter(user__city__icontains=city)
        return queryset.order_by('user__username')


class InitiativeViewSet(viewsets.ModelViewSet):
    queryset = Initiative.objects.select_related('volunteer__user')
    serializer_class = InitiativeSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsVolunteer()]
        return [AllowAny()]

    def perform_create(self, serializer):
        volunteer = VolunteerProfile.objects.filter(user=self.request.user).first()
        if not volunteer:
            raise ValidationError('Профиль волонтёра не найден.')
        serializer.save(volunteer=volunteer)

    def perform_update(self, serializer):
        initiative = self.get_object()
        if initiative.volunteer.user != self.request.user:
            raise PermissionDenied('Можно редактировать только свои инициативы.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.volunteer.user != self.request.user:
            raise PermissionDenied('Можно удалять только свои инициативы.')
        instance.delete()


class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = VolunteerApplication.objects.select_related('volunteer__user', 'event', 'event__organization')
        if user.user_type == 'volunteer':
            volunteer = VolunteerProfile.objects.filter(user=user).first()
            if not volunteer:
                return VolunteerApplication.objects.none()
            return queryset.filter(volunteer=volunteer)
        if user.user_type == 'organization':
            organization = Organization.objects.filter(user=user).first()
            if not organization:
                return VolunteerApplication.objects.none()
            return queryset.filter(event__organization=organization)
        return VolunteerApplication.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsOrganization])
    def set_status(self, request, pk=None):
        application = self.get_object()
        if application.event.organization.user != request.user:
            raise PermissionDenied('Нельзя менять статус чужой заявки.')

        new_status = request.data.get('status')
        if new_status not in dict(VolunteerApplication.STATUS_CHOICES):
            raise ValidationError('Некорректный статус.')

        application.status = new_status
        application.save(update_fields=['status'])
        return Response(VolunteerApplicationSerializer(application).data)


class VolunteerReviewCreateView(generics.CreateAPIView):
    serializer_class = VolunteerReviewSerializer
    permission_classes = [IsOrganization]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def perform_create(self, serializer):
        organization = Organization.objects.filter(user=self.request.user).first()
        if not organization:
            raise ValidationError('Организация не найдена.')

        event = serializer.validated_data['event']
        volunteer = serializer.validated_data['volunteer']

        if event.organization != organization:
            raise PermissionDenied('Мероприятие не принадлежит вашей организации.')

        approved = VolunteerApplication.objects.filter(
            event=event,
            volunteer=volunteer,
            status='approved',
        ).exists()
        if not approved:
            raise ValidationError('Нельзя оставить отзыв: волонтёр не был одобрен.')

        serializer.save(organization=organization)


class OrganizationReviewCreateView(generics.CreateAPIView):
    serializer_class = OrganizationReviewSerializer
    permission_classes = [IsVolunteer]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def perform_create(self, serializer):
        volunteer = VolunteerProfile.objects.filter(user=self.request.user).first()
        if not volunteer:
            raise ValidationError('Профиль волонтёра не найден.')

        event = serializer.validated_data['event']
        organization = serializer.validated_data['organization']
        if event.organization != organization:
            raise ValidationError('Организация не совпадает с мероприятием.')

        approved = VolunteerApplication.objects.filter(
            event=event,
            volunteer=volunteer,
            status='approved',
        ).exists()
        if not approved:
            raise ValidationError('Нельзя оставить отзыв: вы не участвовали в этом мероприятии.')

        serializer.save(volunteer=volunteer)
