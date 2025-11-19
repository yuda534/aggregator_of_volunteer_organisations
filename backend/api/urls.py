from rest_framework.routers import DefaultRouter
from .views import UserViewSet, VolunteerProfileViewSet, OrganizationViewSet, EventViewSet, VolunteerApplicationViewSet

router = DefaultRouter()

router.register('users', UserViewSet)  # /api/users/
router.register('volunteers', VolunteerProfileViewSet)  # /api/volunteers/
router.register('organizations', OrganizationViewSet)  # /api/organizations/
router.register('events', EventViewSet)  # /api/events/
router.register('applications', VolunteerApplicationViewSet)  # /api/applications/

urlpatterns = router.urls

#--------------------------------------------#

from rest_framework import serializers
from .models import User
class UserSerializer(serializers. ModelSerializer):
class Meta:
model = User
fields = ['id', 'username', 'email', 'password']
extra_kwargs = {'password': {'write_only': True}}
def create(self, validated_data):
user = User.objects.create_user(**validated_data)
return user