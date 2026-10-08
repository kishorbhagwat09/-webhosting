from django.urls import path
from .views import database_list_create_view, database_detail_view

urlpatterns = [
    path('', database_list_create_view, name='database_list_create'),
    path('<int:db_id>/', database_detail_view, name='database_detail'),
]
