from django.urls import path
from .views import (
    list_files_view,
    file_content_view,
    create_item_view,
    delete_item_view,
    upload_file_view
)

urlpatterns = [
    path('<int:project_id>/list/', list_files_view, name='file_list'),
    path('<int:project_id>/content/', file_content_view, name='file_content'),
    path('<int:project_id>/create/', create_item_view, name='file_create'),
    path('<int:project_id>/delete/', delete_item_view, name='file_delete'),
    path('<int:project_id>/upload/', upload_file_view, name='file_upload'),
]
