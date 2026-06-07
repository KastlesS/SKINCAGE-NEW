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
