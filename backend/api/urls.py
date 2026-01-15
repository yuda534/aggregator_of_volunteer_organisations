from django.urls import path
from . import views

urlpatterns = [
    # Главная
    path('', views.home_view, name='home'),

    # Events
    path('events/', views.event_list_view, name='event_list'),
    path('events/<int:pk>/', views.event_detail_view, name='event_detail'),

    # Organizations
    path('organizations/', views.organization_list_view, name='organization_list'),
    path('organizations/<int:pk>/', views.organization_detail_view, name='organization_detail'),

    # Volunteers
    path('volunteers/', views.volunteer_list_view, name='volunteer_list'),
    path('volunteers/<int:pk>/', views.volunteer_detail_view, name='volunteer_detail'),

    # Applications
    path('applications/', views.application_list_view, name='application_list'),
    path('applications/<int:pk>/', views.application_detail_view, name='application_detail'),

    # Auth (HTML)
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
]
