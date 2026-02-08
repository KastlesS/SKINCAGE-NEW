# Skincage - Proyecto Django con Docker

Este proyecto contiene la configuración completa para desplegar una aplicación Django (Skincage) en producción usando Docker y Docker Compose.

## 📁 Estructura del proyecto

```
.
├── docker-compose.yml              # Configuración base (volúmenes y servicios comunes)
├── docker-compose.override.yml      # Configuración para desarrollo local
├── docker-compose.prod.yml          # Configuración para producción
├── Dockerfile                       # Imagen Docker de la aplicación
├── .dockerignore                    # Archivos a ignorar en el build
├── requirements.txt                 # Dependencias Python
│
├── skincage/                        # Código fuente de Django
│   ├── manage.py
│   ├── skincage/                   # Configuración principal
│   ├── skins/                      # App principal
│   ├── login/                      # App de login
│   ├── users/                      # App de usuarios
│   └── ...
│
├── scripts/
│   └── entrypoint.sh                # Script para iniciar gunicorn en producción
│
├── nginx/
│   ├── nginx.conf                   # Configuración principal de Nginx
│   └── conf.d/
│       └── skincage.conf           # Vhost de la aplicación
│
├── secrets/
│   ├── secret_key.txt               # SECRET_KEY de Django (⚠️ CONFIDENCIAL)
│   └── db_password.txt              # Contraseña PostgreSQL (⚠️ CONFIDENCIAL)
│
├── certbot/                         # Certificados SSL (se genera en producción)
│   ├── conf/                        # Configuración de letsencrypt
│   └── www/                         # Validación de dominio
│
├── .env.example                     # Plantilla de variables de entorno
├── deploy.sh                        # Script automatizado de deployment
├── DEPLOYMENT.md                    # Guía completa de deployment
└── README.md                        # Este archivo
```

## 🐳 Archivos Docker Compose

### `docker-compose.yml` (Base)
Archivo principal que define:
- Nombre del contenedor: `skincage_web`
- Imagen base: `skincage:latest`
- Volúmenes compartidos para estáticos y media
- Red interna

### `docker-compose.override.yml` (Desarrollo)
Extiende la configuración base para desarrollo local:
- **Build**: Compila la imagen desde el Dockerfile
- **Command**: Ejecuta `python manage.py runserver`
- **DEBUG**: `True`
- **Port**: `8000:8000`
- **Volumen**: Monta el código local (hot reload)
- **BD**: SQLite local

**Uso**: 
```bash
docker compose up
```

### `docker-compose.prod.yml` (Producción)
Configuración para producción con 4 servicios:

#### 1. **web** (Aplicación Django)
- Pull de imagen: `tu_usuario_dockerhub/skincage:latest`
- Comando: Script `entrypoint.sh` que ejecuta gunicorn
- Secrets: SECRET_KEY y contraseña de BD
- Depende de: `db`
- Volúmenes: estáticos, media y scripts

#### 2. **migrate** (Migración de BD)
- Pull de imagen: `tu_usuario_dockerhub/skincage:latest`
- Comando: `python manage.py migrate --noinput`
- Se ejecuta una sola vez al iniciar
- Depende de: `db`

#### 3. **db** (Base de datos PostgreSQL)
- Imagen: `postgres:15-alpine`
- Volumen persistente: `db_volume:/var/lib/postgresql/data`
- Variables de entorno desde secrets
- Health check automático

#### 4. **nginx** (Servidor web inverso)
- Imagen: `nginx:alpine`
- Puertos: `80:80` y `443:443`
- Gestiona SSL/TLS
- Sirve estáticos y proxea requests a Django
- Depende de: `web`

**Uso**:
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 🔑 Secrets y Configuración

### Archivos requeridos

```bash
# Generar SECRET_KEY
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
echo "RESULTADO_ANTERIOR" > secrets/secret_key.txt

# Generar contraseña de BD
openssl rand -base64 32
echo "RESULTADO_ANTERIOR" > secrets/db_password.txt

# Permisos seguros
chmod 600 secrets/*.txt
```

> ⚠️ **IMPORTANTE**: 
> - Nunca commitear `secrets/` en Git
> - Nunca compartir contenidos de estos archivos
> - Usar valores seguros en producción

## 📋 Pasos para deployment

### 1. Preparación (Desarrollo local)

```bash
# Clonar proyecto
git clone <repositorio> skincage
cd skincage

# Copiar ejemplo de env
cp .env.example .env

# Iniciar servicios de desarrollo
docker compose up -d
docker compose exec web python skincage/manage.py migrate
docker compose exec web python skincage/manage.py createsuperuser
```

Acceder a: http://localhost:8000

### 2. Build y push a DockerHub

```bash
# Login
docker login

# Build
docker build -t tu_usuario/skincage:latest .

# Push
docker push tu_usuario/skincage:latest
```

Actualizar `docker-compose.prod.yml` con tu usuario.

### 3. Deployment en VPS

```bash
# En el VPS
git clone <repositorio> /home/tu_usuario/skincage
cd /home/tu_usuario/skincage

# Crear secrets
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' > secrets/secret_key.txt
openssl rand -base64 32 > secrets/db_password.txt
chmod 600 secrets/*.txt

# Actualizar configuración
nano nginx/conf.d/skincage.conf  # Editar dominio
nano docker-compose.prod.yml      # Editar usuario de DockerHub

# Iniciar
docker compose -f docker-compose.prod.yml up -d
```

### 4. Configurar SSL

```bash
# Con certbot
sudo certbot certonly --standalone -d tu_dominio.com -d www.tu_dominio.com

# Copiar certificados
sudo cp -r /etc/letsencrypt/live/tu_dominio.com certbot/conf/live/
sudo chown -R tu_usuario:tu_usuario certbot/

# Reiniciar nginx
docker compose -f docker-compose.prod.yml restart nginx
```

## 🚀 Comandos útiles

### Desarrollo

```bash
# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f

# Ejecutar comando en web
docker compose exec web python skincage/manage.py shell

# Acceder a la BD
docker compose exec db sqlite3 db.sqlite3

# Detener
docker compose down
```

### Producción

```bash
# Iniciar
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f web

# Migraciones
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py migrate

# Crear superusuario
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py createsuperuser

# Recolectar estáticos
docker compose -f docker-compose.prod.yml exec web python skincage/manage.py collectstatic --noinput

# Backup de BD
docker compose -f docker-compose.prod.yml exec db pg_dump -U skincage_user skincage_db > backup.sql

# Actualizar imagen
docker pull tu_usuario/skincage:latest
docker compose -f docker-compose.prod.yml up -d
```

## 📝 Variables de entorno

Ver [.env.example](.env.example) para toda la documentación.

Principales:
- `DEBUG`: `True` en desarrollo, `False` en producción
- `ALLOWED_HOSTS`: Dominios permitidos
- `SECRET_KEY`: Clave secreta de Django
- `DB_*`: Credenciales de base de datos

## 🔐 Seguridad

### Checklist de seguridad para producción

- [ ] SECRET_KEY es único y seguro
- [ ] Contraseña de BD es fuerte (32+ caracteres)
- [ ] DEBUG = False
- [ ] ALLOWED_HOSTS incluye el dominio real
- [ ] SSL/TLS configurado en nginx
- [ ] secrets/ NO está en Git (.gitignore)
- [ ] Permisos: `chmod 600 secrets/*.txt`
- [ ] Firewall: Solo puertos 80, 443 abiertos
- [ ] Backups diarios de BD configurados

## 📚 Documentación adicional

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para:
- Guía paso a paso completa
- Configuración de Django
- Troubleshooting
- Mantenimiento
- Renovación de certificados SSL

## 🐛 Troubleshooting

### Puerto 8000 ya en uso
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

### Base de datos no inicia
```bash
docker compose down -v
docker compose up -d
```

### Estáticos no se sirven
```bash
docker compose exec web python skincage/manage.py collectstatic --noinput
docker compose restart web
```

### Problemas de permisos en archivo
```bash
docker compose exec -u root web chown -R www-data:www-data /code/skincage/
```

## 📞 Soporte

Para problemas o preguntas, revisa:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Guía completa
2. [Docker docs](https://docs.docker.com/)
3. [Django docs](https://docs.djangoproject.com/)
4. [Nginx docs](https://nginx.org/en/docs/)

---

**Versión**: 1.0  
**Última actualización**: 2026-02-08  
**Tecnologías**: Django 5.2, PostgreSQL 15, Nginx, Docker, Gunicorn
