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
        img = self.imagenes.first()
        return img.url if img else None

    @property
    def es_stattrak(self):
        return self.stattrack

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    class EstadoChoices(models.TextChoices):
        PENDIENTE   = 'pendiente',   'Pendiente'
        CONFIRMADA  = 'confirmada',  'Confirmada'
        CANCELADA   = 'cancelada',   'Cancelada'
        COMPLETADA  = 'completada',  'Completada'

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
    duracion_horas = models.PositiveSmallIntegerField(
        choices=[(1, '1 hora'), (6, '6 horas'), (12, '12 horas'), (24, '24 horas'), (48, '48 horas'), (72, '72 horas')],
        default=24,
        verbose_name='Duración en horas',
    )
    fecha_expiracion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Expiración',
    )

    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha_reserva']

    def __str__(self):
        return f"{self.usuario.username} — {self.skin.nombre} ({self.estado})"

    def ha_expirado(self):
        from django.utils import timezone
        return self.fecha_expiracion and timezone.now() > self.fecha_expiracion

    def tiempo_restante(self):
        from django.utils import timezone
        if self.fecha_expiracion:
            delta = self.fecha_expiracion - timezone.now()
            return max(delta.total_seconds(), 0)
        return 0

    @classmethod
    def expirar_pendientes(cls):
        from django.utils import timezone
        expiradas = cls.objects.filter(
            estado=cls.EstadoChoices.CONFIRMADA,
            fecha_expiracion__lt=timezone.now()
        )
        expiradas.update(estado=cls.EstadoChoices.COMPLETADA)