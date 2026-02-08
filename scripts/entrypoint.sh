#!/bin/bash

# Leer las variables desde los secrets
export SECRET_KEY=$(cat /run/secrets/secret_key)
export DB_PASSWORD=$(cat /run/secrets/db_password)

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
