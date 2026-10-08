from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'name', 'description', 'framework',
            'status', 'port', 'container_id', 'custom_domain',
            'git_repo', 'env_vars', 'cpu_limit', 'ram_limit',
            'created_at', 'updated_at'
        ]
