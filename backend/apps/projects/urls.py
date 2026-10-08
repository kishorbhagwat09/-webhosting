from django.urls import path
from .views import (
    project_list_create_view,
    project_detail_view,
    detect_project_framework_view
)

urlpatterns = [
    path('', project_list_create_view, name='project_list_create'),
    path('<int:project_id>/', project_detail_view, name='project_detail'),
    path('<int:project_id>/detect-framework/', detect_project_framework_view, name='detect_framework'),
]
