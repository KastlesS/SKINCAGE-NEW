from typing import Any
from django.core.paginator import Paginator
from django.http.response import HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.contrib.auth.mixins import UserPassesTestMixin
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView, DetailView, View
from django.contrib import messages
from django.db import transaction
from django.utils import timezone
import datetime
from .models import Skin, Reserva
from .mixins import SkinMixin
from .form import SkinForm
from urllib.parse import urlencode

class RequestUserMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated
    
    def handle_no_permission(self):
        return redirect('mercado')

class SkinDetailView(RequestUserMixin, DetailView):
    model = Skin
    template_name = 'skins/skin_detail.html'
    context_object_name = 'skin'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        related = Skin.objects.filter(
            categoria=self.object.categoria
        ).exclude(id=self.object.id).order_by('?')[:12]
        context['related_skins'] = related

        filtros = self.request.GET.copy()
        encoded = urlencode(filtros)
        context['current_filters'] = f"?{encoded}" if encoded else ""
        
        Reserva.expirar_pendientes()
        context['skin_reservada'] = self.object.reservas.filter(
            estado=Reserva.EstadoChoices.CONFIRMADA,
            fecha_expiracion__gt=timezone.now()
        ).exists()
        
        return context

class AdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff
    
    def handle_no_permission(self):
        return redirect('home')


class ConfirmarReservaView(RequestUserMixin, DetailView):
    model = Skin
    template_name = 'skins/confirmar_reserva.html'
    context_object_name = 'skin'

    def get(self, request, *args, **kwargs):
        Reserva.expirar_pendientes()
        self.object = self.get_object()
        
        if self.object.reservas.filter(
            estado=Reserva.EstadoChoices.CONFIRMADA,
            fecha_expiracion__gt=timezone.now()
        ).exists():
            messages.error(request, 'Esta skin ya no está disponible para reserva.')
            return redirect('skins')
            
        context = self.get_context_data(object=self.object)
        context['balance'] = request.user.profile.balance
        context['multiplicadores'] = Reserva.MULTIPLICADORES_DURACION
        return self.render_to_response(context)
        
    def post(self, request, *args, **kwargs):
        Reserva.expirar_pendientes()
        self.object = self.get_object()
        
        if self.object.reservas.filter(
            estado=Reserva.EstadoChoices.CONFIRMADA,
            fecha_expiracion__gt=timezone.now()
        ).exists():
            messages.error(request, 'Esta skin ya ha sido reservada por otro usuario.')
            return redirect('skins')
            
        try:
            duracion = int(request.POST.get('duracion', 24))
        except ValueError:
            duracion = 24
            
        if duracion not in [1, 6, 12, 24, 48, 72]:
            duracion = 24
            
        precio = Reserva.calcular_precio(self.object.precio, duracion)
        perfil = request.user.profile
        
        with transaction.atomic():
            if perfil.balance < precio:
                messages.error(request, 'Balance insuficiente para realizar esta reserva.')
                return redirect('confirmar_reserva', pk=self.object.pk)
                
            fecha_exp = timezone.now() + datetime.timedelta(hours=duracion)
            Reserva.objects.create(
                usuario=request.user,
                skin=self.object,
                estado=Reserva.EstadoChoices.CONFIRMADA,
                precio_reserva=precio,
                duracion_horas=duracion,
                fecha_expiracion=fecha_exp
            )
            
            perfil.balance -= precio
            perfil.save()
            
        messages.success(request, f'Has reservado la skin {self.object.nombre} por {duracion} horas.')
        return redirect('perfil')


class CancelarReservaView(RequestUserMixin, View):
    def post(self, request, *args, **kwargs):
        reserva = get_object_or_404(Reserva, pk=kwargs['pk'], usuario=request.user, estado=Reserva.EstadoChoices.CONFIRMADA)
        
        with transaction.atomic():
            reserva.estado = Reserva.EstadoChoices.CANCELADA
            reserva.save()
            
            perfil = request.user.profile
            perfil.balance += reserva.precio_reserva
            perfil.save()
            
        messages.success(request, 'La reserva ha sido cancelada y se ha devuelto el dinero a tu balance.')
        return redirect('perfil')


# Create your views here.
class VistaSkins(RequestUserMixin,TemplateView):
    template_name = 'skins/home.html'

    def get_context_data(self, **kwargs):
        context = super(VistaSkins, self).get_context_data(**kwargs)
        
        aspecto = self.request.GET.get("aspecto", "")
        price_min = self.request.GET.get("price_min", "")
        price_max = self.request.GET.get("price_max", "")
        float_min = self.request.GET.get("float_min", "")
        float_max = self.request.GET.get("float_max", "")
        stattrak = self.request.GET.get("stattrak", "")
        marcado_view = self.request.GET.get("marcado", "")

        Reserva.expirar_pendientes()
        skins = Skin.objects.all()

        ids_reservados = Reserva.objects.filter(
            estado=Reserva.EstadoChoices.CONFIRMADA,
            fecha_expiracion__gt=timezone.now()
        ).values_list('skin_id', flat=True)
        skins = skins.exclude(id__in=ids_reservados)

        if aspecto:
            skins = skins.filter(nombre__icontains=aspecto)
        
        if price_min:
            try:
                skins = skins.filter(precio__gte=float(price_min))
            except ValueError:
                pass
        
        if price_max:
            try:
                skins = skins.filter(precio__lte=float(price_max))
            except ValueError:
                pass
            
        if float_min:
            try:
                skins = skins.filter(desgaste__gte=float(float_min))
            except ValueError:
                pass
            
        if float_max:
            try:
                skins = skins.filter(desgaste__lte=float(float_max))
            except ValueError:
                pass

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

        paginador = Paginator(skins, 50)
        pagina = self.request.GET.get("page", 1)
        context['skin'] = paginador.get_page(pagina)

        filtros = self.request.GET.copy()
        if 'page' in filtros:
            filtros.pop('page')
        encoded = urlencode(filtros)
        context['current_filters'] = f"&{encoded}" if encoded else ""
        context['filter_params'] = encoded

        return context
    
class SkinCreate(SkinMixin,CreateView):
    model = Skin
    form_class = SkinForm
    success_message = "Skin creada correctamente"
    success_url = reverse_lazy('home')

class SkinUpdate(AdminRequiredMixin, SkinMixin, UpdateView):
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

class AdminPanelView(AdminRequiredMixin, TemplateView):
    template_name = 'skins/admin_panel.html'

