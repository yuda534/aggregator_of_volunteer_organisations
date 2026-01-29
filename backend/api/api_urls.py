from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api_views import (
    EventViewSet,
    InitiativeViewSet,
    OrganizationViewSet,
    VolunteerViewSet,
    ApplicationViewSet,
    RegisterView,
    MeView,
    VolunteerReviewCreateView,
    OrganizationReviewCreateView,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'volunteers', VolunteerViewSet, basename='volunteer')
router.register(r'initiatives', InitiativeViewSet, basename='initiative')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reviews/volunteers/', VolunteerReviewCreateView.as_view(), name='review-volunteer'),
    path('reviews/organizations/', OrganizationReviewCreateView.as_view(), name='review-organization'),
    path('', include(router.urls)),
]
