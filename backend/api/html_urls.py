from django.urls import path

from . import html_views

urlpatterns = [
    # HOME
    path('', html_views.home_view, name='home'),

    # EVENTS
    path('events/', html_views.event_list_view, name='event_list'),
    path('events/<int:pk>/', html_views.event_detail_view, name='event_detail'),

    # ORGANIZATIONS
    path('organizations/', html_views.organization_list_view, name='organization_list'),
    path('organizations/<int:pk>/', html_views.organization_detail_view, name='organization_detail'),

    # VOLUNTEERS
    path('volunteers/', html_views.volunteer_list_view, name='volunteer_list'),
    path('volunteers/<int:pk>/', html_views.volunteer_detail_view, name='volunteer_detail'),

    # APPLICATIONS
    path('applications/', html_views.application_list_view, name='application_list'),
    path('applications/<int:pk>/', html_views.application_detail_view, name='application_detail'),
]
