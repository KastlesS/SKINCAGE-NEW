from django.db import models
from django.conf import settings

# Create your models here.
class Categoria(models.TextChoices):
    PISTOL = "PISTOL", "Pistola"
    SMG = "SMG", "Subfusil"
    RIFLE = "RIFLE", "Rifle"
    SNIPER = "SNIPER", "Francotirador"
    SHOTGUN = "SHOTGUN", "Escopeta"
    MACHINE_GUN = "MACHINE_GUN", "Ametralladora"
    KNIFE = "KNIFE", "Cuchillo"
    GLOVES = "GLOVES", "Guantes"


class Rareza(models.TextChoices):
    CONSUMER = "CONSUMER", "Consumer Grade"
    INDUSTRIAL = "INDUSTRIAL", "Industrial Grade"
    MIL_SPEC = "MIL_SPEC", "Mil-Spec"
    RESTRICTED = "RESTRICTED", "Restricted"
    CLASSIFIED = "CLASSIFIED", "Classified"
    COVERT = "COVERT", "Covert"
    CONTRABAND = "CONTRABAND", "Contraband"


class Skin(models.Model):
    nombre = models.CharField(verbose_name='nombre', blank=False, null=False, max_length=50)
    desgaste = models.DecimalField(verbose_name='float', blank=False, null=False, max_digits=13, decimal_places=12)
    stattrack = models.BooleanField(verbose_name='stattrack', blank=False, null=False)
    precio = models.DecimalField(verbose_name='precio', blank=False, null=False, max_digits=8, decimal_places=2)
    stock = models.IntegerField(verbose_name='stock')
    categoria = models.CharField(max_length=30, choices=Categoria.choices)
    rareza = models.CharField(max_length=30, choices=Rareza.choices)

    @property
    def imagen_url(self):
        # Retrieve the first related image from the new 'images' app
        img = self.imagenes.first()
        return img.url if img else None

    @property
    def es_stattrak(self):
        return self.stattrack

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    """Reserva de una skin por parte de un usuario registrado."""

    class EstadoChoices(models.TextChoices):
        PENDIENTE   = 'pendiente',   'Pendiente'
        CONFIRMADA  = 'confirmada',  'Confirmada'
        CANCELADA   = 'cancelada',   'Cancelada'

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name='Usuario',
    )
    skin = models.ForeignKey(
        Skin,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name='Skin',
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoChoices.choices,
        default=EstadoChoices.PENDIENTE,
        verbose_name='Estado',
    )
    precio_reserva = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name='Precio en el momento de reserva',
    )
    fecha_reserva = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Reserva',
    )
    fecha_modificacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Modificación',
    )
    notas = models.TextField(
        blank=True,
        default='',
        verbose_name='Notas',
    )

    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha_reserva']

    def __str__(self):
        return f"{self.usuario.username} — {self.skin.nombre} ({self.estado})"