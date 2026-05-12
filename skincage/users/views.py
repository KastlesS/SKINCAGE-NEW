from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from skins.models import Reserva
import json


class ProfilePageView(LoginRequiredMixin, TemplateView):
    """Sirve el template del perfil de usuario."""
    template_name = 'users/profile.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        profile = user.profile

        # Skins en reserva
        reservas = Reserva.objects.filter(usuario=user).select_related('skin').order_by('-fecha_reserva')

        context['page_title'] = f'Perfil de {user.username}'
        context['profile'] = profile
        context['reservas'] = reservas
        return context


class UpdateProfileView(LoginRequiredMixin, View):
    """Actualiza los datos del perfil del usuario (username, first_name, avatar)."""
    login_url = 'login'

    def post(self, request, *args, **kwargs):
        user = request.user
        profile = user.profile

        # Datos de texto
        new_username = request.POST.get('username', '').strip()
        new_first_name = request.POST.get('first_name', '').strip()

        if new_username and new_username != user.username:
            from django.contrib.auth.models import User
            if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
                return JsonResponse({'error': 'Ese nombre de usuario ya está en uso.'}, status=400)
            user.username = new_username

        user.first_name = new_first_name
        user.save()

        # Avatar
        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']

        profile.save()

        return JsonResponse({'success': True, 'message': 'Perfil actualizado correctamente.'})
