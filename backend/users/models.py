from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = (
        ('volunteer', 'Волонтер'),
        ('organization', 'Организация'),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPES)
