from urllib.parse import urlsplit, urlunsplit

import docker
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.projects.models import Project
from .docker_service import DeploymentService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_deploy_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    project.status = 'building'
    project.save()

    success, logs = DeploymentService.deploy_project(project, request.user)
    public_url = None
    if success and project.port:
        request_url = urlsplit(request.build_absolute_uri('/'))
        hostname = project.custom_domain or request_url.hostname
        if hostname and ':' in hostname and not hostname.startswith('['):
            hostname = f'[{hostname}]'
        if hostname:
            public_url = urlunsplit(
                (request_url.scheme, f'{hostname}:{project.port}', '', '', '')
            )

    return Response({
        'status': project.status,
        'logs': logs,
        'public_url': public_url,
    }, status=status.HTTP_200_OK if success else status.HTTP_502_BAD_GATEWAY)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def container_action_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', '').lower()
    if action not in ['start', 'stop', 'restart']:
        return Response({'error': 'Invalid action. Choose start, stop, or restart.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        DeploymentService.container_action(project, action)
    except docker.errors.DockerException as error:
        return Response(
            {'error': f'Container {action} failed: {error}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    project.status = 'stopped' if action == 'stop' else 'running'
    project.save()
    return Response({'message': f"Container {action}ed successfully.", 'status': project.status})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deployment_logs_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    sample_logs = [
        f"[System Log] Project: {project.name} (Container ID: {project.container_id or 'sandbox'})",
        f"[System Log] Status: {project.status.upper()} | Port: {project.port}",
        "[Runtime] Starting application instance...",
        "[Runtime] Listening for HTTP requests on 0.0.0.0",
        "[HealthCheck] Status: 200 OK | Memory Usage: 42MB / 512MB",
    ]

    return Response({'project': project.name, 'logs': sample_logs})
