"""
URL configuration for skincage project.
"""
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from skins.views import VistaSkins, SkinCreate, SkinUpdate, SkinDeleteView, Home, MercadoViewRegistered
from login.views import LoginFormView2, Logout, RegisterView
from skins.api.views import SkinListViewSet, SkinCRUDView, SkinPublicViewSet, ReservaViewSet
from users.views import ProfilePageView, UpdateProfileView

router = DefaultRouter()
router.register('skin-list', SkinListViewSet, basename='skin-list')
router.register('skin-crud', SkinCRUDView, basename='skin-crud')
router.register('skin-public', SkinPublicViewSet, basename='skin-public')
router.register('reservas', ReservaViewSet, basename='reservas')

urlpatterns = [
    path('', Home.as_view(), name="home"),
    path('skins/', VistaSkins.as_view(), name='skins'),
    path('admin/', admin.site.urls),
    path('create/', view=SkinCreate.as_view(), name="crear"),
    path('update/<int:pk>/', view=SkinUpdate.as_view(), name="update"),
    path('delete/<int:pk>/', SkinDeleteView.as_view(), name='delete'),
    path('login/', LoginFormView2.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', Logout.as_view(), name='logout'),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('api/', include(router.urls)),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/users/', include('users.api.urls')),
    path('mercado/', MercadoViewRegistered.as_view(), name='mercado'),
    path('perfil/', ProfilePageView.as_view(), name='perfil'),
    path('perfil/actualizar/', UpdateProfileView.as_view(), name='perfil-actualizar'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
