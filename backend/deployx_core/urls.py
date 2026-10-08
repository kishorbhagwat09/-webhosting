from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/filemanager/', include('apps.filemanager.urls')),
    path('api/deployment/', include('apps.deployment.urls')),
    path('api/databases/', include('apps.databases.urls')),
    path('api/monitoring/', include('apps.monitoring.urls')),
]
