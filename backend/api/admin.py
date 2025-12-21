from django.contrib import admin
from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication,
    VolunteerReview,
    OrganizationReview,
)


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'user_type', 'is_verified', 'created_at')
    list_filter = ('user_type', 'is_verified')
    search_fields = ('username', 'email')


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'rating', 'is_active', 'created_at')
    search_fields = ('user__username',)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_verified', 'created_at')
    search_fields = ('name',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'organization', 'status', 'start_date')
    list_filter = ('status',)
    search_fields = ('title',)


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'volunteer', 'event', 'status', 'applied_at')
    list_filter = ('status',)


@admin.register(VolunteerReview)
class VolunteerReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'volunteer', 'organization', 'event', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('volunteer__user__username',)


@admin.register(OrganizationReview)
class OrganizationReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'organization', 'volunteer', 'event', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('organization__name',)
