from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('volunteer', 'Волонтер'),
        ('organization', 'Организация'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)  # телефон
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)  # аватар
    bio = models.TextField(blank=True)  # описание
    city = models.CharField(max_length=100, blank=True)  # город
    is_verified = models.BooleanField(default=False)  # подтвержден ли аккаунт
    created_at = models.DateTimeField(auto_now_add=True)  # дата регистрации

    def __str__(self):
        return self.username  # отображаем username в админке

class VolunteerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # связь с пользователем
    skills = models.TextField(blank=True)  # навыки волонтера
    experience = models.TextField(blank=True)  # опыт работы
    date_of_birth = models.DateField(null=True, blank=True)  # дата рождения
    is_active = models.BooleanField(default=True)  # активен ли волонтер
    created_at = models.DateTimeField(auto_now_add=True)  # дата создания профиля

    def __str__(self):
        return f"Volunteer: {self.user.username}"  # отображение в админке

class Organization(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # связь с пользователем
    name = models.CharField(max_length=255)  # название организации
    description = models.TextField()  # описание организации
    logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)  # логотип
    website = models.URLField(blank=True)  # сайт организации
    contact_email = models.EmailField()  # контактный email
    address = models.TextField()  # адрес организации
    is_verified = models.BooleanField(default=False)  # проверена ли организация
    created_at = models.DateTimeField(auto_now_add=True)  # дата регистрации

    def __str__(self):
        return self.name  # отображаем название в админке

class Event(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Черновик'),
        ('active', 'Активно'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    )
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)  # организация-создатель
    title = models.CharField(max_length=255)  # название мероприятия
    description = models.TextField()  # описание мероприятия
    start_date = models.DateTimeField()  # дата начала
    end_date = models.DateTimeField()  # дата окончания
    location = models.CharField(max_length=500)  # место проведения
    required_volunteers = models.PositiveIntegerField()  # сколько волонтеров нужно
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')  # статус
    created_at = models.DateTimeField(auto_now_add=True)  # дата создания

    def __str__(self):
        return self.title  # отображаем название в админке

class VolunteerApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    )
    
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE)  # волонтер
    event = models.ForeignKey(Event, on_delete=models.CASCADE)  # мероприятие
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # статус заявки
    applied_at = models.DateTimeField(auto_now_add=True)  # когда подана заявка

    class Meta:
        unique_together = ['volunteer', 'event']

    def __str__(self):
        return f"{self.volunteer} -> {self.event}"  # отображение в админке