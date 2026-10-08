from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_view, user_profile_view

urlpatterns = [
    path('register/', register_view, name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('profile/', user_profile_view, name='auth_profile'),
]
