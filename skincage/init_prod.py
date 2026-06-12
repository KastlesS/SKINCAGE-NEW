import os
import sys
import django

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skincage.settings')
django.setup()

from django.contrib.auth import get_user_model
from skins.models import Skin
from scrape_skins import scrape_and_populate

User = get_user_model()

def main():
    print("=== Iniciando Configuración Automatizada de Producción ===")

    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@skincage.com')
    admin_password = os.getenv('ADMIN_PASSWORD', 'AdminPassword123!')

    if not User.objects.filter(username=admin_username).exists():
        print(f"Creando superusuario '{admin_username}'...")
        User.objects.create_superuser(admin_username, admin_email, admin_password)
        print("¡Superusuario creado con éxito!")
    else:
        print(f"El superusuario '{admin_username}' ya existe. Saltando creación.")

    skin_count = Skin.objects.count()
    if skin_count == 0:
        print("La base de datos de skins está vacía. Iniciando carga automática de skins...")
        try:
            scrape_and_populate(1000)
            print("¡Carga automática de skins completada!")
        except Exception as e:
            print(f"Error al poblar las skins: {e}")
    else:
        print(f"La base de datos ya contiene {skin_count} skins. Saltando carga.")

    print("=== Configuración de Producción Finalizada ===")

if __name__ == "__main__":
    main()
