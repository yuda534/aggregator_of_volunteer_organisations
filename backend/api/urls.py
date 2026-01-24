from django.urls import path
from . import views

urlpatterns = [
    # Home
    path('', views.home_view, name='home'),

    # Profile
    path('profile/<int:user_id>/', views.profile_view, name='profile'),

    # Events
    path('events/', views.event_list_view, name='event_list'),
    path('events/<int:pk>/', views.event_detail_view, name='event_detail'),

    # Organizations
    path('organizations/', views.organization_list_view, name='organization_list'),
    path('organizations/<int:pk>/', views.organization_detail_view, name='organization_detail'),

    # Volunteers
    path('volunteers/', views.volunteer_list_view, name='volunteer_list'),
    path('volunteers/<int:pk>/', views.volunteer_detail_view, name='volunteer_detail'),

    # Map
    path('map/', views.map_view, name='map'),

    # Auth
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

    # Applications
    path('my-applications/', views.my_applications_view, name='my_applications'),
    path('organization/applications/', views.organization_applications_view, name='organization_applications'),
    path('applications/<int:pk>/<str:status>/', views.update_application_status_view, name='update_application_status'),
    path('applications/<int:pk>/no-show/', views.mark_no_show_view, name='mark_no_show'),

    # Reviews
    path('reviews/volunteer/<int:event_id>/<int:volunteer_id>/', views.leave_volunteer_review_view, name='leave_volunteer_review'),
    path('reviews/organization/<int:event_id>/<int:organization_id>/', views.leave_organization_review_view, name='leave_organization_review'),

    # Create Event
    path('create-event/', views.create_event_view, name='create_event'),

    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
]
