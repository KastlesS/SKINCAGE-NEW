from typing import Any
from django.core.paginator import Paginator
from django.http.response import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.shortcuts import redirect
from django.contrib.auth.mixins import UserPassesTestMixin
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from .models import Skin
from .mixins import SkinMixin
from .form import SkinForm
from urllib.parse import urlencode

class RequestUserMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated
    
    def handle_no_permission(self):
        return redirect('mercado')

# Create your views here.
class VistaSkins(RequestUserMixin,TemplateView):
    template_name = 'skins/home.html'

    def get_context_data(self, **kwargs):
        context = super(VistaSkins, self).get_context_data(**kwargs)
        
        aspecto = self.request.GET.get("aspecto")
        price_min = self.request.GET.get("price_min", "")
        price_max = self.request.GET.get("price_max", "")
        float_min = self.request.GET.get("float_min", "")
        float_max = self.request.GET.get("float_max", "")
        stattrak = self.request.GET.get("stattrak", "")
        marcado_view = self.request.GET.get("marcado", "")

        skins = Skin.objects.all()

        if aspecto:
            skins = skins.filter(nombre__icontains=aspecto)
        
        if price_min:
            skins = skins.filter(precio__gte=price_min)
        
        if price_max:
            skins = skins.filter(precio__lte=price_max)
            
        if float_min:
            skins = skins.filter(desgaste__gte=float_min)
            
        if float_max:
            skins = skins.filter(desgaste__lte=float_max)

        if stattrak == 'on': 
            skins = skins.filter(stattrack=True)

       
        if marcado_view == 'True':
            skins = skins.order_by("nombre")

        context['aspecto'] = aspecto
        context['price_min'] = price_min
        context['price_max'] = price_max
        context['float_min'] = float_min
        context['float_max'] = float_max
        context['stattrak'] = stattrak
        context['marcado'] = marcado_view

        paginador = Paginator(skins, 20)
        pagina = self.request.GET.get("page", 1)
        context['skin'] = paginador.get_page(pagina)

        # filtros = self.request.GET.copy()
        # if 'page' in filtros:
        #     filtros.pop('page')
        # context['querystring'] = urlencode(filtros)

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
    success_url = reverse_lazy('skins')

class SkinDeleteView(DeleteView):
    model = Skin
    success_url = reverse_lazy('home')

class Home(TemplateView):
    template_name = 'portfolio/index.html'

class MercadoViewRegistered(TemplateView):
    template_name = 'skins/mercado_register.html'

