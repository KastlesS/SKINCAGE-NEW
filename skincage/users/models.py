from django.db import models

# Create your models here.
class User(models.Model):
    password = models.CharField(verbose_name="Contraseña", null=False, blank=False, max_length=60)
    nombre = models.CharField(verbose_name="Nombre Usuario", null=False, blank=False, max_length=40)
    email = models.CharField(verbose_name="Email", max_length=70)
    tel = models.CharField(verbose_name="Teléfono", max_length=9)
    balance = models.DecimalField(verbose_name="Balance", max_digits=7, decimal_places=2)
    steam_api_token = models.CharField(max_length=255,unique=True,help_text="Steam Web API Key")
    activo = models.BooleanField(verbose_name="Cuenta Activa", default=True)
    fecha_creacion = models.DateTimeField(verbose_name="Fecha de Creación", auto_now_add=True)
    fecha_modificacion = models.DateTimeField(verbose_name="Fecha de Modificación", auto_now=True)
    is_admin = models.BooleanField(verbose_name="Es Administrador", default=False)