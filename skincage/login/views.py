from django.shortcuts import render

# Create your views here.
from typing import Any
from django.http import HttpRequest
from django.http.response import HttpResponse as HttpResponse
from django.shortcuts import render
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import redirect
from django.urls import reverse_lazy


# Create your views here.
class LoginFormView2(LoginView):
    template_name = 'login/login.html'
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
            email = data.get('email', '').strip()
            password = data.get('password', '')
            
            if not email or not password:
                return JsonResponse({'error': 'Email y contraseña son obligatorios.'}, status=400)
            
            if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Ya existe un usuario con este correo.'}, status=400)
            
            user = User.objects.create_user(username=email, email=email, password=password)
            # Log the user in after successful registration
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return JsonResponse({'success': True, 'redirect_url': str(reverse_lazy('home'))})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)