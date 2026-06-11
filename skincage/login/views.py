from typing import Any
from django.shortcuts import render, redirect
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .forms import EmailLoginForm


@receiver(user_logged_in)
def enviar_correo_inicio_sesion(sender, request, user, **kwargs):
    """Manda un correo de aviso cada vez que el usuario inicia sesión.
    Se ejecuta en un hilo separado para no bloquear la respuesta HTTP."""
    if not user.email:
        return

    import threading
    from django.utils import timezone
    import pytz

    ip = (
        request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        or request.META.get('REMOTE_ADDR', 'desconocida')
    )

    hora_utc = timezone.now()
    try:
        tz_madrid = pytz.timezone('Europe/Madrid')
        hora_local = hora_utc.astimezone(tz_madrid).strftime('%d/%m/%Y a las %H:%M')
    except Exception:
        hora_local = hora_utc.strftime('%d/%m/%Y a las %H:%M UTC')

    def _enviar():
        try:
            cuerpo_html = render_to_string('login/email_inicio_sesion.html', {
                'usuario': user.username or user.email,
                'hora': hora_local,
                'ip': ip,
                'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://skincage.online'),
            })
            send_mail(
                subject='🔔 Nuevo inicio de sesión en Skincage',
                message=(
                    f'Hola {user.username or user.email},\n\n'
                    f'Se ha iniciado sesión en tu cuenta Skincage el {hora_local} '
                    f'desde la IP {ip}.\n\n'
                    'Si no fuiste tú, cambia tu contraseña inmediatamente.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=cuerpo_html,
                fail_silently=True,
            )
        except Exception:
            pass

    hilo = threading.Thread(target=_enviar, daemon=True)
    hilo.start()

class LoginFormView2(LoginView):
    template_name = 'login/login.html'
    authentication_form = EmailLoginForm
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs: Any):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Iniciar Sesión'
        return context


class Logout(LogoutView):
    next_page = reverse_lazy('home')


import json
from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login


class RegisterView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not username or not email or not password:
                return JsonResponse({'error': 'Nombre de usuario, email y contraseña son obligatorios.'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Ese nombre de usuario ya está en uso.'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Ya existe una cuenta con ese correo.'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return JsonResponse({'success': True, 'redirect_url': str(reverse_lazy('home'))})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib import messages
from django.core.cache import cache

TOKEN_TTL_SEGUNDOS = 3600  # 1 hora


class SolicitudRecuperacionView(View):
    """Muestra y procesa el formulario de solicitud de recuperación."""
    from .forms import SolicitudRecuperacionForm

    def get(self, request):
        from .forms import SolicitudRecuperacionForm
        form = SolicitudRecuperacionForm()
        return render(request, 'login/recuperar_contrasena.html', {
            'form': form,
            'title': 'Recuperar contraseña',
        })

    def post(self, request):
        from .forms import SolicitudRecuperacionForm
        form = SolicitudRecuperacionForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            user = User.objects.filter(email=email).first()

            if user:
                token = secrets.token_urlsafe(48)
                cache_key = f'reset_pwd_{token}'
                cache.set(cache_key, user.pk, TOKEN_TTL_SEGUNDOS)

                reset_url = request.build_absolute_uri(
                    reverse_lazy('cambiar_contrasena', kwargs={'token': token})
                )

                cuerpo_html = render_to_string('login/email_recuperacion.html', {
                    'usuario': user.username or user.email,
                    'reset_url': reset_url,
                    'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://skincage.online'),
                })

                send_mail(
                    subject='🔑 Recupera tu contraseña de Skincage',
                    message=(
                        f'Hola {user.username or user.email},\n\n'
                        f'Haz clic en este enlace para restablecer tu contraseña:\n{reset_url}\n\n'
                        'El enlace caduca en 1 hora. Si no solicitaste esto, ignora este correo.'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=cuerpo_html,
                    fail_silently=False,
                )

            return render(request, 'login/recuperar_contrasena.html', {
                'form': form,
                'title': 'Recuperar contraseña',
                'enviado': True,
            })

        return render(request, 'login/recuperar_contrasena.html', {
            'form': form,
            'title': 'Recuperar contraseña',
        })


class CambiarContrasenaView(View):
    """Muestra y procesa el formulario para establecer la nueva contraseña."""

    def _obtener_usuario(self, token):
        cache_key = f'reset_pwd_{token}'
        user_pk = cache.get(cache_key)
        if user_pk is None:
            return None, None
        try:
            user = User.objects.get(pk=user_pk)
            return user, cache_key
        except User.DoesNotExist:
            return None, None

    def get(self, request, token):
        from .forms import CambiarContrasenaForm
        user, _ = self._obtener_usuario(token)
        if user is None:
            return render(request, 'login/token_invalido.html', {
                'title': 'Enlace inválido',
            })
        form = CambiarContrasenaForm()
        return render(request, 'login/cambiar_contrasena.html', {
            'form': form,
            'token': token,
            'title': 'Nueva contraseña',
        })

    def post(self, request, token):
        from .forms import CambiarContrasenaForm
        user, cache_key = self._obtener_usuario(token)
        if user is None:
            return render(request, 'login/token_invalido.html', {
                'title': 'Enlace inválido',
            })

        form = CambiarContrasenaForm(request.POST)
        if form.is_valid():
            user.set_password(form.cleaned_data['nueva_contrasena'])
            user.save()
            cache.delete(cache_key) 
            return render(request, 'login/cambiar_contrasena.html', {
                'form': form,
                'token': token,
                'title': 'Nueva contraseña',
                'exito': True,
            })

        return render(request, 'login/cambiar_contrasena.html', {
            'form': form,
            'token': token,
            'title': 'Nueva contraseña',
        })