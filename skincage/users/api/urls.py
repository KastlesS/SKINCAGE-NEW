from django.urls import path
from .views import ProfileView, RegisterView, AdminUserListView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('register/', RegisterView.as_view(), name='user-register'),
    path('all/', AdminUserListView.as_view(), name='user-all'),
]
