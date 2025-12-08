from django.db import models

class Ed_org(models.Model):
    name = models.CharField(max_length=50)

class User(models.Model):
    name = models.CharField(max_length=50)
    school = models.ForeignKey(Ed_org, on_delete=models.CASCADE)
