from django.urls import include, path
from rest_framework.routers import DefaultRouter
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
router.register('applications', VolunteerApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('map/', include('api.map_urls')),
]