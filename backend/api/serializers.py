from rest_framework.routers import DefaultRouter
from .views import UserViewSet, VolunteerProfileViewSet, OrganizationViewSet, EventViewSet, VolunteerApplicationViewSet

router = DefaultRouter()

router.register('users', UserViewSet)  # /api/users/
router.register('volunteers', VolunteerProfileViewSet)  # /api/volunteers/
router.register('organizations', OrganizationViewSet)  # /api/organizations/
router.register('events', EventViewSet)  # /api/events/
router.register('applications', VolunteerApplicationViewSet)  # /api/applications/

urlpatterns = router.urls