from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg


# ======================================================
# USER
# ======================================================

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('volunteer', 'Волонтер'),
        ('organization', 'Организация'),
    )

    # Переопределяем поле email, чтобы сделать его обязательным и уникальным
    email = models.EmailField(
        'email address',
        unique=True,  # email должен быть уникальным
        blank=False,  # не может быть пустым
        error_messages={
            'unique': "Пользователь с таким email уже существует.",
        }
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


# ======================================================
# VOLUNTEER
# ======================================================

class VolunteerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    skills = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    rating = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def recalculate_rating(self):
        avg = self.volunteerreview_set.aggregate(avg=Avg('rating'))['avg']
        self.rating = round(avg or 0, 2)
        self.save(update_fields=['rating'])

    def __str__(self):
        return f"Volunteer: {self.user.username}"


# ======================================================
# ORGANIZATION
# ======================================================

class Organization(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)  
    logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)
    website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True) 
    address = models.TextField(blank=True)  
    rating = models.FloatField(default=0.0)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def recalculate_rating(self):
        avg = self.organizationreview_set.aggregate(avg=Avg('rating'))['avg']
        self.rating = round(avg or 0, 2)
        self.save(update_fields=['rating'])

    def __str__(self):
        return self.name


# ======================================================
# EVENT
# ======================================================

class Event(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Черновик'),
        ('active', 'Активно'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    )

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=500)
    required_volunteers = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def approved_count(self):
        return self.volunteerapplication_set.filter(status='approved').count()

    def is_open(self):
        return (
            self.status == 'active'
            and self.approved_count() < self.required_volunteers
        )

    def auto_close_if_full(self):
        if self.approved_count() >= self.required_volunteers:
            self.status = 'completed'
            self.save(update_fields=['status'])


# ======================================================
# APPLICATION
# ======================================================

class VolunteerApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    )

    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    # заложено под автоматическое снижение рейтинга
    no_show_marked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('volunteer', 'event')

    def __str__(self):
        return f"{self.volunteer} -> {self.event}"


# ======================================================
# REVIEWS (заложено на будущее)
# ======================================================

class VolunteerReview(models.Model):
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('volunteer', 'event')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.volunteer.recalculate_rating()


class OrganizationReview(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('organization', 'event', 'volunteer')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.organization.recalculate_rating()
