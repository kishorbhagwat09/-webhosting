import os
import random
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .models import Project
from .serializers import ProjectSerializer
from .framework_detector import detect_framework

def allocate_free_port():
    """Assigns an unassigned port in range 8000-8999."""
    used_ports = set(Project.objects.exclude(port__isnull=True).values_list('port', flat=True))
    for p in range(8001, 8999):
        if p not in used_ports:
            return p
    return random.randint(9000, 9999)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_list_create_view(request):
    if request.method == 'GET':
        projects = Project.objects.filter(owner=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'Project name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing project with same name for user
        if Project.objects.filter(owner=request.user, name=name).exists():
            return Response({'error': f'A project named "{name}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        framework = request.data.get('framework', 'static')
        git_repo = request.data.get('git_repo', '')
        cpu_limit = request.data.get('cpu_limit', '0.5')
        ram_limit = request.data.get('ram_limit', '512M')

        assigned_port = allocate_free_port()

        project = Project.objects.create(
            owner=request.user,
            name=name,
            framework=framework,
            git_repo=git_repo,
            port=assigned_port,
            cpu_limit=cpu_limit,
            ram_limit=ram_limit,
            status='stopped'
        )

        # Create folder under user_projects/<username>/<project_name>
        project_dir = os.path.join(settings.PROJECTS_STORAGE_ROOT, request.user.username, name)
        os.makedirs(project_dir, exist_ok=True)

        # Create default index.html if empty
        index_file = os.path.join(project_dir, 'index.html')
        if not os.path.exists(index_file):
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(f"<!DOCTYPE html>\n<html>\n<head>\n<title>{name} - DeployX</title>\n</head>\n<body>\n<h1>Welcome to {name}!</h1>\n<p>Deployed with DeployX Cloud Platform.</p>\n</body>\n</html>")

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Remove directory storage
        project_dir = os.path.join(settings.PROJECTS_STORAGE_ROOT, request.user.username, project.name)
        project.delete()
        return Response({'message': 'Project deleted successfully.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_project_framework_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    project_dir = os.path.join(settings.PROJECTS_STORAGE_ROOT, request.user.username, project.name)
    detected = detect_framework(project_dir)
    project.framework = detected
    project.save()

    return Response({'detected_framework': detected, 'project': ProjectSerializer(project).data})
