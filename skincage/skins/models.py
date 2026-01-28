from django.db import models

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