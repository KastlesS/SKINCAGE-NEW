from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from django.db.models import F

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
        
        users = User.objects.all().values('id', 'username', 'email', 'is_staff', 'date_joined', balance=F('profile__balance'))
        return Response(list(users))

class AddBalanceView(APIView):
    """
    POST /api/users/balance/add/
    Body: { "amount": <float> }
    Añade saldo al perfil del usuario.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        amount_str = request.data.get('amount')
        try:
            from decimal import Decimal, InvalidOperation
            amount = Decimal(str(amount_str))
            if amount <= 0:
                return Response({"error": "El importe debe ser mayor que 0."}, status=status.HTTP_400_BAD_REQUEST)
            if amount > 10000:
                return Response({"error": "El límite de recarga es 10,000€."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, InvalidOperation):
            return Response({"error": "Importe no válido."}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        profile.balance += amount
        profile.save()

        return Response({
            "success": True,
            "new_balance": profile.balance,
            "message": f"Se han añadido {amount}€ correctamente."
        }, status=status.HTTP_200_OK)

