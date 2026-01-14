from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),

    path('events/', views.event_list_view, name='event_list'),
    path('events/<int:pk>/', views.event_detail_view, name='event_detail'),

    path('organizations/', views.organization_list_view, name='organization_list'),
    path('organizations/<int:pk>/', views.organization_detail_view, name='organization_detail'),

    path('volunteers/', views.volunteer_list_view, name='volunteer_list'),
    path('volunteers/<int:pk>/', views.volunteer_detail_view, name='volunteer_detail'),

    path('applications/', views.application_list_view, name='application_list'),
    path('applications/<int:pk>/', views.application_detail_view, name='application_detail'),
]
