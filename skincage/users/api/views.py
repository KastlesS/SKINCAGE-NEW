from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer, RegisterSerializer


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
