#!/bin/sh
# scripts/entrypoint.sh — Punto de entrada para producción (Gunicorn)
set -e

echo "=== Skincage Entrypoint ==="
echo "Iniciando Gunicorn..."

echo "Ejecutando migraciones de base de datos..."
python skincage/manage.py migrate --noinput

echo "Recolectando archivos estáticos..."
python skincage/manage.py collectstatic --noinput

echo "Iniciando script de configuración de producción..."
python skincage/init_prod.py

exec gunicorn skincage.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --chdir /code/skincage

