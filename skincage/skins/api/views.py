from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from .serializers import SkinSerializer
from skins.models import Skin
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

class SkinPublicViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = SkinSerializer
    pagination_class = Paginador_skin1
    queryset = Skin.objects.all()