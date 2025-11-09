# Registration Settings Documentation

## Overview

Fitur ini memungkinkan admin untuk enable/disable pendaftaran akun baru melalui environment variable. Ini sangat berguna untuk production environment di mana Anda ingin mengontrol siapa yang bisa mendaftar.

## 🚀 Cara Mengaktifkan/Menonaktifkan Registration

### Backend Configuration

Di file `.env` backend:

```env
# Enable registration (default)
ENABLE_REGISTRATION=true

# Disable registration
ENABLE_REGISTRATION=false
```

### Frontend Configuration

Di file `.env` frontend:

```env
# Enable registration (default)
VITE_ENABLE_REGISTRATION=true

# Disable registration
VITE_ENABLE_REGISTRATION=false
```

**Note**: Keduanya harus `true` agar registration berfungsi. Jika salah satu `false`, registration akan dinonaktifkan.

## 🔧 Cara Kerja

### Backend Protection

1. **Middleware**: `CheckRegistrationEnabled` middleware melindungi register endpoint
2. **Route Protection**: Register route memiliki `registration.enabled` middleware
3. **Controller Check**: Double protection di RegisterController
4. **API Status**: `/api/v1/auth/registration-status` endpoint untuk cek status

### Frontend Protection

1. **Custom Hook**: `useRegistrationStatus` hook untuk mengeck status
2. **Route Protection**: `ProtectedRegisterRoute` component
3. **UI Updates**: Login page menampilkan pesan berbeda saat registration disabled
4. **Redirect**: Otomatis redirect ke login jika coba akses register saat disabled

## 📁 Files yang Dimodifikasi

### Backend
- `/.env` - Environment variable
- `/config/app.php` - Configuration
- `/app/Http/Middleware/CheckRegistrationEnabled.php` - Middleware baru
- `/app/Http/Controllers/Api/Auth/RegisterController.php` - Controller protection
- `/routes/api.php` - Route protection
- `/bootstrap/app.php` - Middleware registration

### Frontend
- `/.env` - Environment variable
- `/src/hooks/useRegistrationStatus.js` - Custom hook baru
- `/src/components/common/ProtectedRegisterRoute.jsx` - Protected route component
- `/src/api/auth.api.js` - API function
- `/src/pages/auth/Login.jsx` - UI updates
- `/src/App.jsx` - Route protection

## 🎯 Use Cases

### 1. Production Environment
```env
# Backend .env
ENABLE_REGISTRATION=false

# Frontend .env
VITE_ENABLE_REGISTRATION=false
```
- Mencegah pendaftaran publik
- Hanya admin yang bisa buat user melalui admin panel

### 2. Private Beta
```env
# Backend .env
ENABLE_REGISTRATION=true

# Frontend .env
VITE_ENABLE_REGISTRATION=false
```
- API terbuka tapi frontend ditutup
- Bisa untuk integrasi dengan sistem lain

### 3. Maintenance
```env
# Backend .env
ENABLE_REGISTRATION=false

# Frontend .env
VITE_ENABLE_REGISTRATION=true
```
- Frontend tetap tampil tapi API menolak request
- Berguna untuk scheduled maintenance

## 🔍 API Endpoints

### Get Registration Status
```http
GET /api/v1/auth/registration-status
```

**Response (Enabled):**
```json
{
  "enabled": true,
  "message": "Registration is enabled"
}
```

**Response (Disabled):**
```json
{
  "enabled": false,
  "message": "Registration is disabled"
}
```

### Register Attempt When Disabled
```http
POST /api/v1/auth/register
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Registration is currently disabled",
  "errors": {
    "registration": ["Pendaftaran akun baru sedang dinonaktifkan"]
  }
}
```

## 🧪 Testing

### Test Configuration
```bash
# Check backend config
cd backend
php artisan tinker --execute="echo config('app.registration.enabled')"

# Test API endpoint
curl -X GET http://localhost:8000/api/v1/auth/registration-status
```

### Test Scenarios

1. **Registration Enabled**:
   - Register link muncul di login page
   - Register page accessible
   - Register API bekerja normal

2. **Registration Disabled**:
   - Register link tidak muncul di login page
   - Register page redirect ke login
   - Register API return 403 error

## 🔄 How to Change Status

### Development
```bash
# Backend
cd backend
# Edit .env
ENABLE_REGISTRATION=false
php artisan config:clear

# Frontend
cd frontend
# Edit .env
VITE_ENABLE_REGISTRATION=false
# Restart dev server
npm run dev
```

### Production
```bash
# Backend
cd backend
# Edit .env
ENABLE_REGISTRATION=false
php artisan config:clear
php artisan cache:clear

# Frontend
# Rebuild with new environment variables
npm run build
```

## 🚨 Important Notes

1. **Both Must Be True**: Registration hanya bekerja jika kedua environment variable `true`
2. **Config Cache**: Jangan lupa clear config cache setelah mengubah environment variable
3. **Frontend Build**: Untuk production, rebuild frontend setelah mengubah environment variable
4. **Double Protection**: Sistem memiliki multiple layers of protection (middleware + controller)
5. **User Experience**: Frontend memberikan feedback yang jelas saat registration disabled

## 🐛 Troubleshooting

### Registration Still Enabled After Changes
```bash
# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Restart servers
npm run dev  # frontend
php artisan serve  # backend
```

### Frontend Not Reflecting Changes
```bash
# Restart dev server
npm run dev

# Check browser console for errors
# Check useRegistrationStatus hook logs
```

### API Still Allowing Registration
```bash
# Check middleware registration
php artisan route:list --name=register

# Check config
php artisan tinker
> config('app.registration.enabled')

# Check logs
tail -f storage/logs/laravel.log
```

## 📱 Mobile App Integration

Untuk mobile app, gunakan endpoint `/api/v1/auth/registration-status` untuk mengeck status registration sebelum menampilkan register UI:

```javascript
const checkRegistrationStatus = async () => {
  const response = await fetch('/api/v1/auth/registration-status');
  const data = await response.json();
  return data.enabled;
};

// Hide register UI if disabled
if (!await checkRegistrationStatus()) {
  // Hide register button/link
}
```