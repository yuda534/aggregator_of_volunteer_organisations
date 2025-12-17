from rest_framework import viewsets
from django.conf import settings
from django.shortcuts import render
from .models import CustomUser, VolunteerProfile, Organization, Event, VolunteerApplication
from .serializers import UserSerializer, VolunteerProfileSerializer, OrganizationSerializer, EventSerializer, VolunteerApplicationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsOrganization
from .permissions import IsVolunteer


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()  # все пользователи
    serializer_class = UserSerializer  # используем UserSerializer

class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOrganization()]
        return [AllowAny()]


class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsVolunteer()]
        return [IsAuthenticated()]


def map_view(request):
    return render(
        request,
        'map.html',
        {'YANDEX_MAPS_API_KEY': settings.YANDEX_MAPS_API_KEY}
    )