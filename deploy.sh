#!/bin/bash
# deploy.sh — Script automatizado de deployment en producción
# Uso: chmod +x deploy.sh && ./deploy.sh
set -e

echo "=== Skincage Deployment Script ==="

# Verificar que existen los secrets
if [ ! -f secrets/secret_key.txt ]; then
    echo "ERROR: secrets/secret_key.txt no existe."
    echo "Generarlo con:"
    echo "  python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' > secrets/secret_key.txt"
    exit 1
fi

if [ ! -f secrets/db_password.txt ]; then
    echo "ERROR: secrets/db_password.txt no existe."
    echo "Generarlo con:"
    echo "  openssl rand -base64 32 > secrets/db_password.txt"
    exit 1
fi

chmod 600 secrets/*.txt

echo "✓ Secrets OK"

# Pull de la imagen más reciente
echo "Descargando imagen actualizada..."
docker compose -f docker-compose.prod.yml pull

# Reiniciar servicios
echo "Reiniciando servicios..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# Recolectar estáticos
echo "Recolectando archivos estáticos..."
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py collectstatic --noinput

echo ""
echo "=== Deployment completado ==="
echo "Web: https://skincage.online"
echo "Admin: https://skincage.online/admin"
