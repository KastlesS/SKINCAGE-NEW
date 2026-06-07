from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(models.Model):
    password = models.CharField(verbose_name="Contraseña", null=False, blank=False, max_length=60)
    nombre = models.CharField(verbose_name="Nombre Usuario", null=False, blank=False, max_length=40)
    email = models.CharField(verbose_name="Email", max_length=70)
    tel = models.CharField(verbose_name="Teléfono", max_length=9)
    balance = models.DecimalField(verbose_name="Balance", max_digits=7, decimal_places=2)
    steam_api_token = models.CharField(max_length=255, unique=True, help_text="Steam Web API Key")
    activo = models.BooleanField(verbose_name="Cuenta Activa", default=True)
    fecha_creacion = models.DateTimeField(verbose_name="Fecha de Creación", auto_now_add=True)
    fecha_modificacion = models.DateTimeField(verbose_name="Fecha de Modificación", auto_now=True)
    is_admin = models.BooleanField(verbose_name="Es Administrador", default=False)

    class Meta:
        verbose_name = "Usuario (legado)"
        verbose_name_plural = "Usuarios (legado)"

    def __str__(self):
        return self.nombre


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name="Usuario",
    )
    balance = models.DecimalField(
        verbose_name="Balance",
        max_digits=9,
        decimal_places=2,
        default=0.00,
    )
    steam_api_token = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Steam Web API Key",
    )
    tel = models.CharField(
        verbose_name="Teléfono",
        max_length=20,
        blank=True,
        default="",
    )
    avatar = models.ImageField(
        verbose_name="Foto de perfil",
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Imagen de perfil del usuario",
    )
    avatar_url = models.URLField(
        verbose_name="Avatar URL",
        blank=True,
        default="",
        help_text="URL de imagen de perfil (Steam o Google)",
    )
    fecha_modificacion = models.DateTimeField(
        verbose_name="Última modificación",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"

    def __str__(self):
        return f"Perfil de {self.user.username}"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()