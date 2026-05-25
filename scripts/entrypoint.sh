#!/bin/sh
# scripts/entrypoint.sh — Punto de entrada para producción (Gunicorn)
set -e

echo "=== Skincage Entrypoint ==="
echo "Iniciando Gunicorn..."

# Ejecutar migraciones de la base de datos (idempotente)
echo "Ejecutando migraciones de base de datos..."
python skincage/manage.py migrate --noinput

# Recolectar estáticos (idempotente)
echo "Recolectando archivos estáticos..."
python skincage/manage.py collectstatic --noinput

# Iniciar Gunicorn escuchando en el puerto dinámico de Render o por defecto 8000
exec gunicorn skincage.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --chdir /code

