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
if [ $# -gt 0 ]; then
    exec "$@"
else
    # Si no se le pasa nada (como en tu actual prod.yml), lanza gunicorn por defecto
    echo "Iniciando Gunicorn por defecto..."
    exec gunicorn \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class sync \
        --timeout 60 \
        skincage.wsgi:application
fi
