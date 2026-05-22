from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User


class EmailBackend(ModelBackend):
    """
    Permite autenticar con correo electrónico + contraseña
    en lugar del nombre de usuario por defecto.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        # El campo 'username' del formulario contendrá el email
        email = username or kwargs.get('email')
        if not email or not password:
            return None

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # Si hay duplicados de email (no debería ocurrir), tomamos el primero activo
            user = User.objects.filter(email__iexact=email, is_active=True).first()
            if not user:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
