from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(
        source='profile.balance', max_digits=9, decimal_places=2, read_only=True
    )
    steam_api_token = serializers.CharField(
        source='profile.steam_api_token', read_only=True
    )
    tel = serializers.CharField(source='profile.tel', read_only=True)
    avatar_url = serializers.CharField(source='profile.avatar_url', read_only=True)
    fecha_registro = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'balance', 'steam_api_token', 'tel', 'avatar_url', 'fecha_registro',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Este nombre de usuario ya está en uso."})
        if data.get('email') and User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Ya existe una cuenta con este email."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user
