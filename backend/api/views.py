from rest_framework import viewsets
from django.conf import settings
from django.shortcuts import render
from .models import CustomUser, VolunteerProfile, Organization, Event, VolunteerApplication
from .serializers import UserSerializer, VolunteerProfileSerializer, OrganizationSerializer, EventSerializer, VolunteerApplicationSerializer

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

class VolunteerApplicationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationSerializer

def map_view(request):
    return render(
        request,
        'map.html',
        {'YANDEX_MAPS_API_KEY': settings.YANDEX_MAPS_API_KEY}
    )