from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import SkinSerializer, ReservaSerializer
from skins.models import Skin, Reserva
from .paginator import Paginador_skin1


class SkinListViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SkinSerializer
    pagination_class = Paginador_skin1
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skin.objects.all()


class SkinCRUDView(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = SkinSerializer
    queryset = Skin.objects.all()


class SkinPublicViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = SkinSerializer
    pagination_class = Paginador_skin1
    queryset = Skin.objects.all()


class ReservaViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    Reservas del usuario autenticado.
      GET  /api/reservas/        → lista las reservas del usuario
      POST /api/reservas/        → crea una nueva reserva (body: {skin_id})
      DELETE /api/reservas/{id}/ → cancela (elimina) una reserva propia
    """
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reserva.objects.filter(usuario=self.request.user).select_related('skin')

    def perform_create(self, serializer):
        skin = serializer.validated_data['skin']
        serializer.save(
            usuario=self.request.user,
            precio_reserva=skin.precio,
        )