from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.generic import TemplateView
from django.conf.urls.static import static
from skins.views import VistaSkins, SkinCreate, SkinUpdate, SkinDeleteView, Home, MercadoViewRegistered, SkinDetailView, AdminPanelView, ConfirmarReservaView, CancelarReservaView
from login.views import LoginFormView2, Logout, RegisterView
from skins.api.views import SkinListViewSet, SkinCRUDView, SkinPublicViewSet, ReservaViewSet
from users.views import ProfilePageView, UpdateProfileView, VistaRecargaStripe

router = DefaultRouter()
router.register('skin-list', SkinListViewSet, basename='skin-list')
router.register('skin-crud', SkinCRUDView, basename='skin-crud')
router.register('skin-public', SkinPublicViewSet, basename='skin-public')
router.register('reservas', ReservaViewSet, basename='reservas')

urlpatterns = [
    path('', Home.as_view(), name="home"),
    path('about/', TemplateView.as_view(template_name='portfolio/about.html'), name='about'),
    path('skins/', VistaSkins.as_view(), name='skins'),
    path('admin/', admin.site.urls),
    path('panel/', AdminPanelView.as_view(), name='admin_panel'),
    path('create/', view=SkinCreate.as_view(), name="crear"),
    path('update/<int:pk>/', view=SkinUpdate.as_view(), name="update"),
    path('skin/<int:pk>/', SkinDetailView.as_view(), name='skin_detail'),
    path('skin/<int:pk>/reservar/', ConfirmarReservaView.as_view(), name='confirmar_reserva'),
    path('reserva/<int:pk>/cancelar/', CancelarReservaView.as_view(), name='cancelar_reserva'),
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
    path('perfil/recargar/', VistaRecargaStripe.as_view(), name='perfil-recargar'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
