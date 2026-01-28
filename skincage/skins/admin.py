from django.contrib import admin
from .models import Skin

# Register your models here.
class SkinAdmin(admin.ModelAdmin):
    list_display = list_display_links = ('nombre','desgaste','stattrack','precio','stock','categoria','rareza')

admin.site.register(Skin, SkinAdmin)