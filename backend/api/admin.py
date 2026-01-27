from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    VolunteerProfile,
    Organization,
    Event,
    VolunteerApplication,
    VolunteerReview,
    OrganizationReview
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'created_at')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('user_type', 'phone', 'avatar', 'bio', 'city', 'is_verified')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительная информация', {
            'fields': ('user_type', 'phone', 'city')
        }),
    )


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('user__username', 'user__email', 'skills')
    raw_id_fields = ('user',)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'rating', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('name', 'description', 'address', 'user__username')
    raw_id_fields = ('user',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'start_date', 'status', 'required_volunteers')
    list_filter = ('status', 'start_date')
    search_fields = ('title', 'description', 'location', 'organization__name')
    raw_id_fields = ('organization',)
    date_hierarchy = 'start_date'


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('volunteer', 'event', 'status', 'applied_at', 'no_show_marked')
    list_filter = ('status', 'no_show_marked')
    search_fields = ('volunteer__user__username', 'event__title')
    raw_id_fields = ('volunteer', 'event')


@admin.register(VolunteerReview)
class VolunteerReviewAdmin(admin.ModelAdmin):
    list_display = ('volunteer', 'organization', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('volunteer__user__username', 'organization__name', 'comment')
    raw_id_fields = ('volunteer', 'organization', 'event')


@admin.register(OrganizationReview)
class OrganizationReviewAdmin(admin.ModelAdmin):
    list_display = ('organization', 'volunteer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('organization__name', 'volunteer__user__username', 'comment')
    raw_id_fields = ('organization', 'volunteer', 'event')