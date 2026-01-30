"""
URL configuration for skincage project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from os import name
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path, include
from skins.views import VistaSkins, SkinCreate, SkinUpdate, SkinDeleteView, Home
# from users.views import VistaUsers, CreateUser, DeleteUser, UpdateUser
from login.views import LoginFormView2, Logout
from skins.api.views import SkinListViewSet, SkinCRUDView

router = routers.DefaultRouter()
router.register('skin-list', SkinListViewSet, basename='skin-list')
router.register('skin-crud', SkinCRUDView, basename='skin-crud')

urlpatterns = [
    path('inicio/', Home.as_view(), name="home"),
    path('skins/', VistaSkins.as_view(), name='skins'),
    path('admin/', admin.site.urls),
    path('create/', view=SkinCreate.as_view(), name="crear"),
    path('update/<int:pk>/', view=SkinUpdate.as_view(), name="update"),
    path('delete/<int:pk>/', SkinDeleteView.as_view(), name='delete'),
    # path('user/', VistaUsers.as_view(), name='user'),
    # path('user/create', view=CreateUser.as_view(), name='create-user'),
    # path('user/update/<int:pk>', view=UpdateUser.as_view(), name='update-user'),
    # path('user/delete/<int:pk>', view=DeleteUser.as_view(), name='delete-user'),
    path('', LoginFormView2.as_view(), name='login'),
    path('logout/', Logout.as_view(), name='logout'),
    path('api/', include(router.urls)),
]
