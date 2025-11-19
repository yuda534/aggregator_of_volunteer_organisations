from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=100)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    is_archived = models.BooleanField(default=False)

    def str(self):
        return self.title