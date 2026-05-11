from rest_framework import serializers
from skins.models import Skin, Reserva


class SkinSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    es_stattrak = serializers.SerializerMethodField()
    desgaste_display = serializers.SerializerMethodField()

    class Meta:
        model = Skin
        fields = [
            'id', 'nombre', 'desgaste', 'desgaste_display',
            'stattrack', 'es_stattrak', 'precio', 'stock',
            'categoria', 'rareza', 'imagen_url',
        ]

    def get_imagen_url(self, obj):
        return obj.imagen_url

    def get_es_stattrak(self, obj):
        return obj.es_stattrak

    def get_desgaste_display(self, obj):
        """Convierte el float de desgaste a la categoría de wear."""
        try:
            v = float(obj.desgaste)
        except (TypeError, ValueError):
            return "N/A"
        if v <= 0.07:
            return "Factory New"
        elif v <= 0.15:
            return "Minimal Wear"
        elif v <= 0.38:
            return "Field-Tested"
        elif v <= 0.45:
            return "Well-Worn"
        else:
            return "Battle-Scarred"


class ReservaSerializer(serializers.ModelSerializer):
    skin = SkinSerializer(read_only=True)
    skin_id = serializers.PrimaryKeyRelatedField(
        queryset=Skin.objects.all(), source='skin', write_only=True
    )
    usuario = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Reserva
        fields = [
            'id', 'usuario', 'skin', 'skin_id',
            'estado', 'precio_reserva', 'fecha_reserva', 'notas',
        ]
        read_only_fields = ['precio_reserva', 'fecha_reserva', 'estado', 'usuario']