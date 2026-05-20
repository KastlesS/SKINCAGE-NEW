from django.contrib import admin
from .models import Skin, Reserva

# Register your models here.
class SkinAdmin(admin.ModelAdmin):
    list_display = list_display_links = ('nombre','desgaste','stattrack','precio','stock','categoria','rareza')

admin.site.register(Skin, SkinAdmin)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'skin', 'estado', 'precio_reserva', 'duracion_horas', 'fecha_reserva', 'fecha_expiracion', 'tiempo_restante_admin')
    list_filter = ('estado', 'duracion_horas')
    search_fields = ('usuario__username', 'skin__nombre')
    readonly_fields = ('fecha_reserva', 'fecha_modificacion', 'fecha_expiracion')
    ordering = ('-fecha_reserva',)

    def tiempo_restante_admin(self, obj):
        segundos = obj.tiempo_restante()
        if segundos <= 0:
            return "Expirada"
        horas = int(segundos // 3600)
        minutos = int((segundos % 3600) // 60)
        return f"{horas}h {minutos}m"
    tiempo_restante_admin.short_description = "Tiempo restante"