from django.contrib import admin
from .models import User, Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display   = ('user', 'balance', 'tel', 'fecha_modificacion')
    list_editable  = ('balance',)
    search_fields  = ('user__username', 'user__email')
    raw_id_fields  = ('user',)
    fields         = ('user', 'balance', 'tel', 'steam_api_token', 'avatar', 'avatar_url')
    readonly_fields = ('fecha_modificacion',)


@admin.register(User)
class UserLegadoAdmin(admin.ModelAdmin):
    list_display  = ('nombre', 'email', 'activo', 'is_admin')
    search_fields = ('nombre', 'email')
