#!/bin/bash

set -e

# Cambiar al directorio de la aplicación Django
cd /code/skincage

# Leer las variables desde los secrets y exportarlas como variables de entorno
# para que Django settings.py pueda acceder a ellas

if [ -f /run/secrets/secret_key ]; then
    export SECRET_KEY=$(cat /run/secrets/secret_key)
fi

if [ -f /run/secrets/db_password ]; then
    export DB_PASSWORD=$(cat /run/secrets/db_password)
fi

# Si SECRET_KEY no está definida, genera una para desarrollo (NO USAR EN PRODUCCIÓN)
if [ -z "$SECRET_KEY" ]; then
    echo "WARNING: SECRET_KEY no encontrada en secrets. Usando valor por defecto (NO SEGURO)."
    export SECRET_KEY="django-insecure-development-key-change-me-in-production"
fi

# Ejecutar gunicorn
exec gunicorn \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class sync \
    --worker-tmp-dir /dev/shm \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    skincage.wsgi:application
