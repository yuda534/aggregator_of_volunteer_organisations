from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import map_view
from .views import (
    UserViewSet,
    VolunteerProfileViewSet,
    OrganizationViewSet,
    EventViewSet,
    VolunteerApplicationViewSet,
    event_list_view,
    event_detail_view,
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
    path('events/', event_list_view, name='event_list'),
    path('events/<int:event_id>/', event_detail_view, name='event_detail'),

    path('', include(router.urls)),
    path('map/', map_view, name='map'),
]

