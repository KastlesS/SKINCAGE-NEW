from django import forms
from django.contrib.auth.forms import AuthenticationForm


class EmailLoginForm(AuthenticationForm):
    username = forms.EmailField(
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={
            'autocomplete': 'email',
            'placeholder': 'Ingrese su correo electrónico',
            'class': 'form_control',
        }),
        error_messages={
            'required': 'Por favor, introduce tu correo electrónico.',
            'invalid': 'Introduce un correo electrónico válido.',
        },
    )

    password = forms.CharField(
        label="Contraseña",
        widget=forms.PasswordInput(attrs={
            'autocomplete': 'current-password',
            'placeholder': 'Ingrese su contraseña',
            'class': 'form_control',
        }),
        error_messages={
            'required': 'Por favor, introduce tu contraseña.',
        },
    )

    error_messages = {
        'invalid_login': (
            "Correo electrónico o contraseña incorrectos. "
            "Ten en cuenta que los campos pueden ser sensibles a mayúsculas."
        ),
        'inactive': "Esta cuenta está desactivada.",
    }


class SolicitudRecuperacionForm(forms.Form):
    email = forms.EmailField(
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={
            'autocomplete': 'email',
            'placeholder': 'Ingrese su correo electrónico',
            'class': 'entrada',
            'id': 'id_email_recuperacion',
        }),
        error_messages={
            'required': 'Por favor, introduce tu correo electrónico.',
            'invalid': 'Introduce un correo electrónico válido.',
        },
    )


class CambiarContrasenaForm(forms.Form):
    nueva_contrasena = forms.CharField(
        label="Nueva contraseña",
        widget=forms.PasswordInput(attrs={
            'autocomplete': 'new-password',
            'placeholder': 'Ingrese su nueva contraseña',
            'class': 'entrada',
            'id': 'id_nueva_contrasena',
        }),
        min_length=8,
        error_messages={
            'required': 'Por favor, introduce una nueva contraseña.',
            'min_length': 'La contraseña debe tener al menos 8 caracteres.',
        },
    )

    confirmar_contrasena = forms.CharField(
        label="Confirmar contraseña",
        widget=forms.PasswordInput(attrs={
            'autocomplete': 'new-password',
            'placeholder': 'Confirme su nueva contraseña',
            'class': 'entrada',
            'id': 'id_confirmar_contrasena',
        }),
        error_messages={
            'required': 'Por favor, confirma tu nueva contraseña.',
        },
    )

    def clean(self):
        cleaned_data = super().clean()
        nueva = cleaned_data.get('nueva_contrasena')
        confirmar = cleaned_data.get('confirmar_contrasena')
        if nueva and confirmar and nueva != confirmar:
            raise forms.ValidationError('Las contraseñas no coinciden.')
        return cleaned_data
