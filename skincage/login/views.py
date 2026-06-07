from typing import Any
from django.shortcuts import render, redirect
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from .forms import EmailLoginForm


# Create your views here.
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