from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    # DRF ViewSets
    UserViewSet,
    VolunteerProfileViewSet,
    OrganizationViewSet,
    EventViewSet,
    VolunteerApplicationViewSet,

    # HTML views
    organization_list,
    organization_detail,
    volunteer_list,
    volunteer_detail,
    application_list,
    application_detail,
    event_list_view,
    event_detail_view,
    map_view,
)

# ================= API (DRF) =================
router = DefaultRouter()
router.register('users', UserViewSet)
router.register('volunteers', VolunteerProfileViewSet)
router.register('organizations', OrganizationViewSet)
router.register('events', EventViewSet)
router.register('applications', VolunteerApplicationViewSet, basename='applications')

# ================= URLS =================
urlpatterns = [

    # HTML-страницы
    path('organizations/', organization_list, name='organization_list'),
    path('organizations/<int:pk>/', organization_detail, name='organization_detail'),

    path('volunteers/', volunteer_list, name='volunteer_list'),
    path('volunteers/<int:pk>/', volunteer_detail, name='volunteer_detail'),

    path('applications/', application_list, name='application_list'),
    path('applications/<int:pk>/', application_detail, name='application_detail'),

    path('events/', event_list_view, name='event_list'),
    path('events/<int:event_id>/', event_detail_view, name='event_detail'),

    path('map/', map_view, name='map'),

    # DRF API
    path('', include(router.urls)),
]
