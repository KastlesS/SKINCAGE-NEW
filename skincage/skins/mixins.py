from django.contrib.messages.views import SuccessMessageMixin
from .models import Skin
from django.urls import reverse_lazy

class SkinMixin(SuccessMessageMixin):
    # model = Skin
    # fields = ['id_skin','nombre', 'desgaste', 'stattrack', 'precio', 'stock']

    def get_success_url(self):
        object = self.object
        return reverse_lazy('update', kwargs={'pk': object.id})