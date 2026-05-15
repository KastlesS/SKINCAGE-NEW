from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer, RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/users/profile/  → devuelve el perfil del usuario autenticado
    PATCH /api/users/profile/ → actualiza campos del perfil
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register/
    Body: { username, email, password, password_confirm }
    Devuelve: { access, refresh } JWT tokens para auto-login.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar tokens JWT para auto-login tras el registro
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "detail": "Usuario creado correctamente.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().values('id', 'username', 'email', 'is_staff', 'date_joined')
        return Response(list(users))

