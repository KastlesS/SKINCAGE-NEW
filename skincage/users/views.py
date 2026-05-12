from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class ProfilePageView(LoginRequiredMixin, TemplateView):
    """Sirve el template del perfil de usuario."""
    template_name = 'users/profile.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = f'Perfil de {self.request.user.username}'
        return context
