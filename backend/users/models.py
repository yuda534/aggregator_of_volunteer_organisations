from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_TYPES = (
        ("volunteer", "Волонтёр"),
        ("organization_rep", "Представитель организации"),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPES)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


# -------------------------------
# 1. ПРОФИЛЬ ВОЛОНТЁРА
# -------------------------------

class VolunteerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    age = models.PositiveIntegerField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=30, blank=True)

    # список навыков - через запятую или массив JSON
    skills = models.JSONField(default=list, blank=True)

    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Профиль волонтёра: {self.user.username}"


# -------------------------------
# 2. ОРГАНИЗАЦИЯ
# -------------------------------

class Organization(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    website = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to="org_logos/", blank=True, null=True)

    # модерация
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'одобрена' if self.is_approved else 'на модерации'})"


# -------------------------------
# 3. ПРЕДСТАВИТЕЛЬ ОРГАНИЗАЦИИ
# -------------------------------

class OrganizationRepresentative(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} -> {self.organization.name}"


# -------------------------------
# 4. МЕРОПРИЯТИЕ
# -------------------------------

class Event(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()

    # место
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    date = models.DateTimeField()

    volunteers_needed = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.title


# -------------------------------
# 5. УЧАСТИЕ В МЕРОПРИЯТИИ
# -------------------------------

class Participation(models.Model):
    STATUS_CHOICES = (
        ("pending", "Ожидает"),
        ("approved", "Подтвержден"),
        ("declined", "Отклонён"),
    )

    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"{self.volunteer.user.username} → {self.event.title} ({self.status})"


# -------------------------------
# 6. ОТЗЫВЫ ОРГАНИЗАЦИЯМ
# -------------------------------

class ReviewOrganization(models.Model):
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    rating = models.PositiveIntegerField(default=5)
    text = models.TextField(blank=True)

    def __str__(self):
        return f"Отзыв волонтёра {self.volunteer.user.username} → {self.organization.name}"


# -------------------------------
# 7. ОТЗЫВЫ ВОЛОНТЁРАМ
# -------------------------------

class ReviewVolunteer(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)

    rating = models.PositiveIntegerField(default=5)
    text = models.TextField(blank=True)

    def __str__(self):
        return f"Отзыв организации {self.organization.name} → {self.volunteer.user.username}"
