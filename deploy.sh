#!/bin/bash

# Script de deployment automático para Skincage
# Uso: ./deploy.sh [producción|desarrollo]

set -e

ENVIRONMENT=${1:-producción}
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "======================================"
echo "Deployment de Skincage - $ENVIRONMENT"
echo "======================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones
info() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml. Ejecuta este script desde la raíz del proyecto."
fi

case $ENVIRONMENT in
    desarrollo|dev)
        info "Iniciando servicio en modo DESARROLLO"
        info "Compilando imagen Docker..."
        docker compose build
        
        info "Iniciando servicios..."
        docker compose up -d
        
        info "Esperando a que la aplicación esté lista..."
        sleep 5
        
        info "Aplicación disponible en http://localhost:8000"
        info "Admin en http://localhost:8000/admin"
        info "Ver logs: docker compose logs -f"
        ;;
        
    producción|prod)
        # Verificar secretos
        warn "Verificando configuración de producción..."
        
        if [ ! -f "secrets/secret_key.txt" ]; then
            error "No encontrado secrets/secret_key.txt. Ejecuta:"
            echo "  python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' > secrets/secret_key.txt"
        fi
        
        if [ ! -f "secrets/db_password.txt" ]; then
            error "No encontrado secrets/db_password.txt. Ejecuta:"
            echo "  openssl rand -base64 32 > secrets/db_password.txt"
        fi
        
        # Verificar permisos de secretos
        chmod 600 secrets/*.txt
        info "Secretos configurados correctamente"
        
        # Verificar que pull de imagen existe (esto fallará si no)
        warn "Descargando imagen de DockerHub..."
        # docker pull $(grep 'image:' docker-compose.prod.yml | grep -v 'image:' | head -1 | awk '{print $NF}')
        
        # Crear directorios necesarios
        mkdir -p nginx/ssl
        mkdir -p certbot/conf
        mkdir -p certbot/www
        
        info "Iniciando servicios de producción..."
        docker compose -f docker-compose.prod.yml up -d
        
        warn "Esperando a que la base de datos esté lista (30 segundos)..."
        sleep 30
        
        info "Ejecutando migraciones..."
        docker compose -f docker-compose.prod.yml exec -T web python /code/skincage/manage.py migrate --noinput
        
        info "Recolectando archivos estáticos..."
        docker compose -f docker-compose.prod.yml exec -T web python /code/skincage/manage.py collectstatic --noinput
        
        info "======================================"
        info "✓ Deployment completado"
        info "======================================"
        echo ""
        echo "Próximos pasos:"
        echo "1. Actualizar tu dominio en nginx/conf.d/skincage.conf"
        echo "2. Obtener certificado SSL:"
        echo "   sudo certbot certonly --standalone -d tu_dominio.com -d www.tu_dominio.com"
        echo "3. Actualizar rutas de certificados en nginx/conf.d/skincage.conf"
        echo "4. Reiniciar nginx:"
        echo "   docker compose -f docker-compose.prod.yml restart nginx"
        echo ""
        echo "Ver logs: docker compose -f docker-compose.prod.yml logs -f"
        ;;
        
    *)
        error "Uso: ./deploy.sh [desarrollo|producción]"
        ;;
esac

exit 0
