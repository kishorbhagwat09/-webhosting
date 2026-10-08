from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    FRAMEWORK_CHOICES = [
        ('static', 'Static Website'),
        ('react', 'React App'),
        ('node', 'Node.js Server'),
        ('django', 'Django App'),
        ('flask', 'Flask App'),
    ]

    STATUS_CHOICES = [
        ('stopped', 'Stopped'),
        ('building', 'Building'),
        ('running', 'Running'),
        ('failed', 'Failed'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    framework = models.CharField(max_length=20, choices=FRAMEWORK_CHOICES, default='static')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='stopped')
    port = models.IntegerField(null=True, blank=True)
    container_id = models.CharField(max_length=100, blank=True, default='')
    custom_domain = models.CharField(max_length=255, blank=True, default='')
    git_repo = models.CharField(max_length=255, blank=True, default='')
    env_vars = models.JSONField(default=dict, blank=True)
    cpu_limit = models.CharField(max_length=20, default='0.5')
    ram_limit = models.CharField(max_length=20, default='512M')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.framework})"
