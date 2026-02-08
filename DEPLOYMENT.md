# Guía de Deployment - Skincage en Docker

## Estructura de archivos

```
SKINCAGE-NEW/
├── docker-compose.yml              # Configuración base
├── docker-compose.override.yml      # Desarrollo (local)
├── docker-compose.prod.yml          # Producción
├── Dockerfile                       # Imagen Docker
├── requirements.txt                 # Dependencias Python
├── .dockerignore                    # Archivos a ignorar en build
├── skincage/                        # Código de la aplicación
├── scripts/
│   └── entrypoint.sh               # Script para ejecutar gunicorn
├── nginx/
│   ├── nginx.conf                  # Configuración principal de Nginx
│   └── conf.d/
│       └── skincage.conf           # Configuración de servidor Django
├── secrets/
│   ├── secret_key.txt              # SECRET_KEY de Django
│   └── db_password.txt             # Contraseña de PostgreSQL
└── certbot/                        # Certificados SSL (se crea en deployment)
```

## 1. Preparación en el VPS

### 1.1 Instalar Docker y Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose v2
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 1.2 Clonar el repositorio

```bash
cd /home/tu_usuario
git clone <tu_repositorio> skincage
cd skincage
```

### 1.3 Configurar los secretos

```bash
# Generar SECRET_KEY de Django
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Copiar y editar el resultado en secrets/secret_key.txt
echo "TU_SECRET_KEY_GENERADA" > secrets/secret_key.txt

# Generar contraseña de base de datos
openssl rand -base64 32

# Copiar el resultado en secrets/db_password.txt
echo "TU_CONTRASEÑA_GENERADA" > secrets/db_password.txt

# Permisos de seguridad
chmod 600 secrets/*.txt
```

## 2. Configuración de Django

### 2.1 Editar settings.py

```python
# skincage/skincage/settings.py

import os
from pathlib import Path

# Variables de entorno
DEBUG = os.getenv('DEBUG', 'False') == 'True'

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY and os.path.exists('/run/secrets/secret_key'):
    with open('/run/secrets/secret_key', 'r') as f:
        SECRET_KEY = f.read().strip()

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
if os.getenv('DB_ENGINE') == 'django.db.backends.postgresql':
    db_password = os.getenv('DB_PASSWORD')
    if not db_password and os.path.exists('/run/secrets/db_password'):
        with open('/run/secrets/db_password', 'r') as f:
            db_password = f.read().strip()
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'skincage_db'),
            'USER': os.getenv('DB_USER', 'skincage_user'),
            'PASSWORD': db_password,
            'HOST': os.getenv('DB_HOST', 'db'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join('/code/skincage/static')
STATICFILES_DIRS = [
    os.path.join('/code/skincage/static'),
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join('/code/skincage/media')

# Security
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

# CORS (si es necesario)
# CORS_ALLOWED_ORIGINS = [
#     "https://tu_dominio.com",
#     "https://www.tu_dominio.com",
# ]
```

## 3. Configuración de Nginx

### 3.1 Editar nginx/conf.d/skincage.conf

Reemplazar:
- `tu_dominio.com` y `www.tu_dominio.com` con tu dominio real
- Las rutas de certificados SSL

## 4. Build y Push de la imagen a DockerHub

### 4.1 Crear cuenta en DockerHub (si no la tienes)

Ir a https://hub.docker.com y crear una cuenta

### 4.2 Build de la imagen localmente (o en el VPS)

```bash
docker build -t tu_usuario_dockerhub/skincage:latest .
```

### 4.3 Login en DockerHub

```bash
docker login
```

### 4.4 Push de la imagen

```bash
docker push tu_usuario_dockerhub/skincage:latest
```

### 4.5 Actualizar docker-compose.prod.yml

Reemplazar `tu_usuario_dockerhub` por tu usuario real de DockerHub

## 5. Obtener certificados SSL con Let's Encrypt

### 5.1 Con Certbot

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado (requiere que el puerto 80 esté accesible)
sudo certbot certonly --standalone -d tu_dominio.com -d www.tu_dominio.com

# Los certificados se guardan en /etc/letsencrypt/live/tu_dominio.com/

# Copiar a la carpeta del proyecto si es necesario
sudo cp -r /etc/letsencrypt/live/tu_dominio.com ./certbot/conf/live/
sudo chown -R $USER:$USER ./certbot/
```

### 5.2 Renovación automática

```bash
# Editar crontab
sudo crontab -e

# Agregar:
0 2 * * * /usr/bin/certbot renew --quiet --post-hook "docker restart skincage_nginx"
```

## 6. Deployment en producción

### 6.1 Iniciar los servicios

```bash
# En el directorio del proyecto
docker compose -f docker-compose.prod.yml up -d
```

### 6.2 Verificar que todo funciona

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Ejecutar migraciones (se ejecutan automáticamente)
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py migrate

# Crear superusuario si es necesario
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py createsuperuser

# Recolectar estáticos
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py collectstatic --noinput
```

## 7. Desarrollo local

### 7.1 Iniciar con docker-compose.override.yml

```bash
# Los archivos docker-compose.yml y docker-compose.override.yml se cargan automáticamente
docker compose up

# O construir primero
docker compose build
docker compose up
```

### 7.2 Acceder a la aplicación

- URL: http://localhost:8000
- Admin: http://localhost:8000/admin

## 8. Mantenimiento

### 8.1 Backup de la base de datos

```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U skincage_user skincage_db > backup.sql

# Restaurar backup
docker compose -f docker-compose.prod.yml exec -T db psql -U skincage_user skincage_db < backup.sql
```

### 8.2 Ver logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Servicio específico
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f db
```

### 8.3 Actualizar imagen

```bash
docker pull tu_usuario_dockerhub/skincage:latest
docker compose -f docker-compose.prod.yml up -d
```

### 8.4 Detener servicios

```bash
docker compose -f docker-compose.prod.yml down

# Mantener volúmenes
docker compose -f docker-compose.prod.yml down --volumes
```

## 9. Solución de problemas

### Base de datos no existe

```bash
docker compose -f docker-compose.prod.yml down -v  # Eliminar volúmenes
docker compose -f docker-compose.prod.yml up -d    # Recrear
```

### Permisos de estáticos

```bash
docker compose -f docker-compose.prod.yml exec web chmod -R 755 /code/skincage/static
```

### Puerto en uso

```bash
# Buscar proceso en puerto
sudo lsof -i :80
sudo lsof -i :443

# Cambiar puertos en docker-compose.prod.yml
```

---

## Checklist pre-deployment

- [ ] Generar SECRET_KEY y guardar en `secrets/secret_key.txt`
- [ ] Generar contraseña DB y guardar en `secrets/db_password.txt`
- [ ] Actualizar `ALLOWED_HOSTS` en Django settings
- [ ] Actualizar dominio en `nginx/conf.d/skincage.conf`
- [ ] Actualizar usuario de DockerHub en `docker-compose.prod.yml`
- [ ] Build y push de imagen a DockerHub
- [ ] Obtener certificados SSL con Let's Encrypt
- [ ] Configurar DNS apuntando a la IP del VPS
- [ ] Hacer deploy: `docker compose -f docker-compose.prod.yml up -d`
- [ ] Verificar acceso a https://tu_dominio.com
