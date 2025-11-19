from django.contrib import admin
from api.models import CustomUser, VolunteerProfile, Organization, Event, VolunteerApplication

admin.site.register(CustomUser)
admin.site.register(VolunteerProfile)
admin.site.register(Organization)
admin.site.register(Event)
admin.site.register(VolunteerApplication)