from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import map_view
from .views import (
    UserViewSet,
    VolunteerProfileViewSet,
    OrganizationViewSet,
    EventViewSet,
    VolunteerApplicationViewSet,
)

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('volunteers', VolunteerProfileViewSet)
router.register('organizations', OrganizationViewSet)
router.register('events', EventViewSet)
router.register(
    'applications',
    VolunteerApplicationViewSet,
    basename='applications'
)

urlpatterns = [
    path('', include(router.urls)),
    path('map/', map_view, name='map'),
]
