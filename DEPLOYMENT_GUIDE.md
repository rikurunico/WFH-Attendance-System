# Deployment Guide - WFH Attendance System

## 📋 Overview

Panduan lengkap untuk deployment aplikasi WFH Attendance System ke production environment.

---

## 🚀 Quick Start

### Development Environment

**Backend:**
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

## 🏗️ Production Deployment

### Option 1: VPS Deployment (Recommended)

#### Prerequisites
- Ubuntu 22.04 LTS
- Nginx
- PHP 8.2+
- PostgreSQL 15+
- Node.js 18+
- SSL Certificate (Let's Encrypt)

#### Step 1: Backend Deployment

**1.1 Install Dependencies**
```bash
sudo apt update
sudo apt install -y nginx php8.2-fpm php8.2-pgsql php8.2-mbstring php8.2-xml php8.2-curl postgresql
```

**1.2 Setup PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE wfh_attendance;
CREATE USER wfh_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wfh_attendance TO wfh_user;
\q
```

**1.3 Clone & Configure Backend**
```bash
cd /var/www
git clone <your-repo> wfh-attendance
cd wfh-attendance/backend
composer install --optimize-autoloader --no-dev
cp .env.example .env
```

**1.4 Configure .env**
```env
APP_NAME="WFH Attendance System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wfh_attendance
DB_USERNAME=wfh_user
DB_PASSWORD=your_secure_password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**1.5 Setup Application**
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**1.6 Setup Cron for Auto-Checkout**
```bash
crontab -e
# Add this line:
59 23 * * * cd /var/www/wfh-attendance/backend && php artisan attendance:auto-checkout >> /dev/null 2>&1
```

**1.7 Configure Nginx**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/wfh-attendance/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**1.8 Setup SSL**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Step 2: Frontend Deployment

**2.1 Build Frontend**
```bash
cd /var/www/wfh-attendance/frontend
npm install
```

**2.2 Configure Environment**
```bash
# Create .env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=WFH Attendance System
```

**2.3 Build**
```bash
npm run build
```

**2.4 Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/wfh-attendance/frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**2.5 Setup SSL**
```bash
sudo certbot --nginx -d yourdomain.com
```

**2.6 Restart Services**
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

---

### Option 2: Docker Deployment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: wfh_attendance
      POSTGRES_USER: wfh_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - wfh-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - APP_ENV=production
      - DB_HOST=postgres
      - DB_DATABASE=wfh_attendance
      - DB_USERNAME=wfh_user
      - DB_PASSWORD=secure_password
    depends_on:
      - postgres
    networks:
      - wfh-network
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=http://backend:8000/api/v1
    depends_on:
      - backend
    networks:
      - wfh-network
    ports:
      - "3000:80"

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
    networks:
      - wfh-network
    ports:
      - "80:80"
      - "443:443"

volumes:
  postgres_data:

networks:
  wfh-network:
    driver: bridge
```

**Backend Dockerfile:**
```dockerfile
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

WORKDIR /var/www
COPY . .

RUN composer install --optimize-autoloader --no-dev

CMD php artisan serve --host=0.0.0.0 --port=8000
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deploy:**
```bash
docker-compose up -d
```

---

### Option 3: Cloud Deployment

#### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `VITE_API_URL`: Your Railway backend URL
4. Deploy

**Backend on Railway:**
1. Create new project
2. Add PostgreSQL service
3. Add backend service from GitHub
4. Set environment variables
5. Deploy

---

## 🔒 Security Checklist

### Backend
- [ ] `APP_DEBUG=false` in production
- [ ] Strong `APP_KEY` generated
- [ ] Secure database credentials
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SSL certificate installed
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] `.env` file not accessible via web

### Frontend
- [ ] API URL uses HTTPS
- [ ] No sensitive data in localStorage
- [ ] CSP headers configured
- [ ] XSS protection enabled

### Database
- [ ] Strong password
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Only necessary ports open

---

## 📊 Monitoring & Maintenance

### Logging

**Laravel Logs:**
```bash
tail -f /var/www/wfh-attendance/backend/storage/logs/laravel.log
```

**Nginx Logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy

**Database Backup (Daily):**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U wfh_user wfh_attendance > /backups/db_$DATE.sql
# Keep only last 30 days
find /backups -name "db_*.sql" -mtime +30 -delete
```

**Cron:**
```bash
0 2 * * * /path/to/backup.sh
```

### Performance Optimization

**Backend:**
```bash
# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize composer autoload
composer install --optimize-autoloader --no-dev

# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

**Frontend:**
```bash
# Build with optimizations
npm run build

# Serve with gzip compression (Nginx)
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 🔄 Update & Rollback

### Update Application

```bash
cd /var/www/wfh-attendance

# Backup database first
pg_dump -U wfh_user wfh_attendance > backup_before_update.sql

# Pull latest code
git pull origin main

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

### Rollback

```bash
# Restore database
psql -U wfh_user wfh_attendance < backup_before_update.sql

# Rollback code
git reset --hard <previous-commit-hash>

# Rebuild
# ... repeat build steps
```

---

## 📈 Scaling

### Horizontal Scaling

**Load Balancer (Nginx):**
```nginx
upstream backend {
    server backend1.yourdomain.com;
    server backend2.yourdomain.com;
    server backend3.yourdomain.com;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Database Scaling

**Read Replicas:**
- Configure PostgreSQL replication
- Use read replicas for reports
- Master for writes

**Connection Pooling:**
```env
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

## 🐛 Troubleshooting

### Common Issues

**1. 500 Internal Server Error**
```bash
# Check logs
tail -f storage/logs/laravel.log

# Check permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

**2. CORS Issues**
```php
// config/cors.php
'allowed_origins' => [env('FRONTEND_URL')],
'supports_credentials' => true,
```

**3. Database Connection Failed**
```bash
# Test connection
psql -U wfh_user -d wfh_attendance -h localhost

# Check .env configuration
```

**4. Frontend Can't Connect to API**
- Check VITE_API_URL in .env
- Verify CORS settings
- Check network tab in browser DevTools

---

## 📞 Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Contact DevOps team
4. Create issue in repository

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificates ready

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrated
- [ ] Cron jobs configured
- [ ] Services restarted

### Post-Deployment
- [ ] Health check passed
- [ ] Login tested
- [ ] Core features tested
- [ ] Monitoring configured
- [ ] Backup verified

---

**Deployment Date:** ________________  
**Deployed By:** ________________  
**Version:** ________________  
**Status:** ✅ Success / ❌ Failed

---

Good luck with your deployment! 🚀
