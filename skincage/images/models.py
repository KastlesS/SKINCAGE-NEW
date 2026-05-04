from django.db import models
from skins.models import Skin

class Imagen(models.Model):
    id_skin = models.ForeignKey(Skin, on_delete=models.CASCADE, related_name='imagenes')
    url = models.CharField(max_length=500)

    def __str__(self):
        return f"Imagen de {self.id_skin.nombre}"
