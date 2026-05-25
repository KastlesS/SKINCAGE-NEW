from django.urls import path
from .views import ProfileView, RegisterView, AdminUserListView, AddBalanceView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='api_profile'),
    path('register/', RegisterView.as_view(), name='api_register'),
    path('all/', AdminUserListView.as_view(), name='api_all_users'),
    path('balance/add/', AddBalanceView.as_view(), name='api_add_balance'),
]
