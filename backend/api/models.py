from datetime import timedelta

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg
from django.utils import timezone


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

    @property
    def approved_count(self):
        """Количество одобренных заявок (property для использования в шаблонах)"""
        annotated_count = getattr(self, 'approved_applications', None)
        if annotated_count is not None:
            return annotated_count
        return self.volunteerapplication_set.filter(status='approved').count()

    def is_open_for_applications(self):
        """Проверяет, открыт ли набор на мероприятие"""
        now = timezone.now()
        return (
            self.status == 'active'
            and self.approved_count < self.required_volunteers
            and now < self.start_date
        )

    def is_completed(self):
        """Проверяет, завершено ли мероприятие по времени"""
        return timezone.now() > self.end_date

    def auto_update_status(self):
        """Автоматически обновляет статус мероприятия"""
        now = timezone.now()
        
        if self.is_completed():
            self.status = 'completed'
            self.save(update_fields=['status'])
        elif self.approved_count >= self.required_volunteers:
            self.status = 'active'  # остаётся активным, но набор закрыт
            self.save(update_fields=['status'])
    
    def get_status_display_with_details(self):
        """Возвращает детальное отображение статуса на русском языке"""
        now = timezone.now()
        
        # Проверяем, завершено ли мероприятие по времени
        if now > self.end_date:
            return 'Завершено'
        
        # Проверяем статус в БД
        if self.status == 'completed':
            return 'Завершено'
        elif self.status == 'cancelled':
            return 'Отменено'
        elif self.status == 'draft':
            return 'Черновик'
        elif self.status == 'active':
            # Для активных проверяем, есть ли свободные места
            if self.approved_count >= self.required_volunteers:
                return 'Набор закрыт'
            else:
                return 'Набор открыт'
        
        return 'Неизвестно'


# ======================================================
# APPLICATION
# ======================================================

class VolunteerApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
        ('cancelled', 'Отменено волонтёром'),
    )

    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    # заложено под автоматическое снижение рейтинга
    no_show_marked = models.BooleanField(default=False)
    absence_reason_document = models.FileField(upload_to='absence_reasons/', blank=True, null=True)
    absence_reason_comment = models.TextField(blank=True)
    absence_reason_approved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('volunteer', 'event')

    def __str__(self):
        return f"{self.volunteer} -> {self.event}"

    def can_be_cancelled_by_volunteer(self):
        if self.status not in {'pending', 'approved'}:
            return False
        return timezone.now() <= (self.event.start_date - timedelta(hours=24))


# ======================================================
# REVIEWS (заложено на будущее)
# ======================================================

class VolunteerReview(models.Model):
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # 1-5 звезд
    positive_comment = models.TextField(blank=True, verbose_name="Что понравилось")
    negative_comment = models.TextField(blank=True, verbose_name="Что можно улучшить")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('volunteer', 'event', 'organization')
        verbose_name = "Отзыв о волонтёре"
        verbose_name_plural = "Отзывы о волонтёрах"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.volunteer.recalculate_rating()

    def __str__(self):
        return f"Отзыв о {self.volunteer} от {self.organization}"


class OrganizationReview(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()  # 1-5 звезд
    positive_comment = models.TextField(blank=True, verbose_name="Что понравилось")
    negative_comment = models.TextField(blank=True, verbose_name="Что можно улучшить")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('organization', 'event', 'volunteer')
        verbose_name = "Отзыв об организации"
        verbose_name_plural = "Отзывы об организациях"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.organization.recalculate_rating()

    def __str__(self):
        return f"Отзыв об {self.organization} от {self.volunteer}"


# ======================================================
# INITIATIVE
# ======================================================

class Initiative(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Черновик'),
        ('published', 'Опубликовано'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    )
    
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='initiatives/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def get_status_display_color(self):
        colors = {
            'draft': 'secondary',
            'published': 'info',
            'in_progress': 'warning',
            'completed': 'success',
            'cancelled': 'danger',
        }
        return colors.get(self.status, 'secondary')
