from rest_framework import mixins, viewsets
from .serializers import SkinSerializer
from skins.models import Skin
from .paginator import Paginador_skin1

class SkinListViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SkinSerializer
    pagination_class = Paginador_skin1
    def get_queryset(self):
        return Skin.objects.all()
    

class SkinCRUDView(viewsets.ModelViewSet):
    serializer_class = SkinSerializer
    queryset = Skin.objects.all()