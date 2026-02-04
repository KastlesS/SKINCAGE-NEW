from typing import Any
from django.core.paginator import Paginator
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from .models import Skin
from .mixins import SkinMixin
from .form import SkinForm


# Create your views here.
class VistaSkins(TemplateView):
    template_name = 'skins/home.html'

    def get_context_data(self, **kwargs):
        context = super(VistaSkins, self).get_context_data(**kwargs)
        aspecto = self.request.GET.get("aspecto", "")
        if aspecto:
            skins = Skin.objects.filter(nombre__icontains=aspecto)
        else:
            skins = Skin.objects.all()

        marcado_view = self.request.GET.get("marcado", "")

        if marcado_view == 'True':
            context['skin'] = context['skin'].order_by("nombre")

        context['marcado'] = marcado_view
        context['aspecto'] = aspecto

        paginador = Paginator(skins, 20)
        pagina = self.request.GET.get("page", 1)
        context['skin'] = paginador.get_page(pagina)
        
        return context
    
class SkinCreate(SkinMixin,CreateView):
    model = Skin
    form_class = SkinForm
    success_message = "Skin creada correctamente"
    success_url = reverse_lazy('home')

class SkinUpdate(SkinMixin,UpdateView):
    model = Skin
    fields = ['id','nombre', 'desgaste', 'stattrack', 'precio', 'stock', 'categoria', 'rareza']
    success_message = "Skin actualizada correctamente"
    success_url = reverse_lazy('home')

class SkinDeleteView(DeleteView):
    model = Skin
    success_url = reverse_lazy('home')

class Home(TemplateView):
    template_name = 'portfolio/index.html'

