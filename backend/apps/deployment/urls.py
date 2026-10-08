from django.urls import path
from .views import (
    trigger_deploy_view,
    container_action_view,
    deployment_logs_view
)

urlpatterns = [
    path('<int:project_id>/deploy/', trigger_deploy_view, name='deploy_project'),
    path('<int:project_id>/action/', container_action_view, name='container_action'),
    path('<int:project_id>/logs/', deployment_logs_view, name='deployment_logs'),
]
