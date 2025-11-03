# Deployment Guide

## Masalah: 404 Not Found saat Refresh

Ketika user mengakses URL langsung (seperti `/login`) atau refresh halaman, server akan mencoba mencari file di path tersebut. Karena ini adalah Single Page Application (SPA), semua routing di-handle oleh React Router di client-side. Oleh karena itu, server perlu dikonfigurasi untuk mengarahkan semua request ke `index.html`.

## Solusi Berdasarkan Web Server

### 1. Apache (.htaccess)

File `.htaccess` sudah tersedia di root folder frontend. Pastikan:
- Mod `rewrite` sudah diaktifkan di Apache
- File `.htaccess` ada di root folder yang di-deploy

```bash
# Aktifkan mod_rewrite
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 2. Nginx

Salin konfigurasi dari `nginx.conf` ke file konfigurasi Nginx Anda:

```bash
sudo nano /etc/nginx/sites-available/wfh.web.id
```

Atau buat symlink:
```bash
sudo ln -s /etc/nginx/sites-available/wfh.web.id /etc/nginx/sites-enabled/
```

Kemudian test dan reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Poin penting di konfigurasi Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Ini akan mencoba:
1. Serve file jika ada (`$uri`)
2. Serve directory jika ada (`$uri/`)
3. Fallback ke `index.html` jika tidak ada (ini yang membuat SPA bekerja)

### 3. Build Production

Sebelum deploy, pastikan build production:

```bash
cd frontend
npm install
npm run build
```

File hasil build ada di folder `dist/` (untuk Vite).

### 4. Upload ke VPS

Upload **SEMUA** file dari folder `dist/` ke server:
- Apache: `/var/www/html/` atau sesuai konfigurasi
- Nginx: `/var/www/wfh-web-id/` (sesuai root di nginx.conf)

**PENTING**: Pastikan file `.htaccess` juga ikut ter-upload ke root folder di server!

### 5. Set Permission (Linux)

```bash
sudo chown -R www-data:www-data /var/www/wfh-web-id
sudo chmod -R 755 /var/www/wfh-web-id
```

## Checklist

- [ ] File `.htaccess` sudah ada di root folder deploy (otomatis ter-copy saat build)
- [ ] Mod `rewrite` sudah aktif (Apache)
- [ ] Konfigurasi Nginx sudah benar dengan `try_files`
- [ ] Build production sudah dilakukan (`npm run build`)
- [ ] File hasil build dari folder `dist/` sudah di-upload ke server
- [ ] File `.htaccess` ada di root folder di server
- [ ] Permission folder sudah benar
- [ ] Web server sudah di-restart

## Test

1. Akses `https://wfh.web.id` - harus masuk ke homepage
2. Navigasi ke `/login` - harus bisa
3. Refresh halaman di `/login` - harus tetap di `/login` (tidak 404)
4. Akses langsung `https://wfh.web.id/login` - harus bisa

## Troubleshooting

### Masih 404 setelah konfigurasi?

1. **Apache**: Pastikan `AllowOverride All` di konfigurasi virtual host
   ```apache
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```

2. **Nginx**: Pastikan `index.html` ada di root directory yang dikonfigurasi

3. **Cache**: Clear cache browser atau test dengan incognito mode

4. **Logs**: Cek error logs
   - Apache: `sudo tail -f /var/log/apache2/error.log`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
