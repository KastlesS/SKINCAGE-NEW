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

# Arrancar solo la BD primero y esperar a que esté sana
echo "Iniciando base de datos..."
docker compose -f docker-compose.prod.yml up -d db
echo "Esperando a que PostgreSQL esté listo..."
timeout 60 sh -c 'until docker compose -f docker-compose.prod.yml exec -T db pg_isready -U skincage_user -d skincage_db; do sleep 2; done'
echo "✓ Base de datos lista"

# Ejecutar migraciones y esperar a que terminen
echo "Aplicando migraciones..."
docker compose -f docker-compose.prod.yml up migrate
MIGRATE_EXIT=$(docker inspect --format='{{.State.ExitCode}}' skincage_migrate 2>/dev/null || echo "1")

if [ "$MIGRATE_EXIT" != "0" ]; then
    echo ""
    echo "ERROR: Las migraciones fallaron. Logs del contenedor migrate:"
    docker compose -f docker-compose.prod.yml logs migrate
    echo ""
    echo "Abortando deployment."
    exit 1
fi
echo "✓ Migraciones aplicadas"

# Iniciar el resto de servicios
echo "Reiniciando servicios..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# Recolectar estáticos
echo "Recolectando archivos estáticos..."
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py collectstatic --noinput

echo ""
echo "=== Deployment completado ==="
echo "Web: https://skincage.online"
echo "Admin: https://skincage.online/admin"
