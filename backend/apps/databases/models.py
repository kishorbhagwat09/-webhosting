from django.db import models
from django.contrib.auth.models import User

class UserDatabase(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_databases')
    name = models.CharField(max_length=100)
    db_name = models.CharField(max_length=100, unique=True)
    db_user = models.CharField(max_length=100)
    db_password = models.CharField(max_length=255)
    host = models.CharField(max_length=255, default='127.0.0.1')
    port = models.IntegerField(default=3306)
    created_at = models.DateTimeField(auto_now_add=True)

    def connection_string(self):
        return f"mysql://{self.db_user}:{self.db_password}@{self.host}:{self.port}/{self.db_name}"

    def __str__(self):
        return f"MySQL DB: {self.db_name} ({self.owner.username})"
