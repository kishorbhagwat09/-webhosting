import psutil
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.projects.models import Project

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_metrics_view(request):
    """
    Returns real-time server resource usage statistics: CPU %, RAM %, Disk %, active containers.
    """
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    active_projects_count = Project.objects.filter(owner=request.user, status='running').count()
    total_projects_count = Project.objects.filter(owner=request.user).count()

    return Response({
        'cpu': {
            'usage_percent': cpu_percent,
            'cores': psutil.cpu_count(logical=True),
        },
        'memory': {
            'total_gb': round(memory.total / (1024**3), 2),
            'used_gb': round(memory.used / (1024**3), 2),
            'free_gb': round(memory.available / (1024**3), 2),
            'usage_percent': memory.percent,
        },
        'storage': {
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'free_gb': round(disk.free / (1024**3), 2),
            'usage_percent': disk.percent,
        },
        'containers': {
            'running': active_projects_count,
            'total': total_projects_count,
        }
    })
