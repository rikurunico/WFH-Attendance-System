# reCAPTCHA Troubleshooting Guide

## Error: "reCAPTCHA verification failed"

Jika Anda mengalami error "reCAPTCHA verification failed" saat login, ikuti langkah-langkah berikut:

## 🔍 Debugging Steps

### 1. Check Console Logs (Frontend)
Buka browser developer tools (F12) dan lihat Console tab saat login:

- **Token received**: Harus muncul log seperti `"reCAPTCHA token received: 03AOLTBLR..."`
- **API login request**: Harus menunjukkan `captchaTokenLength > 0`

Jika token tidak muncul, artinya reCAPTCHA checkbox belum dicentang atau ada error JavaScript.

### 2. Check Laravel Logs (Backend)
Cek file `backend/storage/logs/laravel.log` untuk error terbaru:

```bash
tail -f backend/storage/logs/laravel.log
```

Cari log dengan pattern:
- `"Verifying reCAPTCHA token"`
- `"reCAPTCHA verification result"`
- `"reCAPTCHA verification failed"`

### 3. Verify Configuration

**Frontend (.env):**
```env
VITE_RECAPTCHA_SITE_KEY=6LdF9AYsAAAAAHtnSSDbTQo2mbgG_5zfBM-xnRz3
```

**Backend (.env):**
```env
RECAPTCHA_SECRET_KEY=6LdF9AYsAAAAAPrZz7ITFJ2f4RGKALmS4KJypn4M
```

**Verify config loaded:**
```bash
cd backend && php artisan tinker --execute="echo config('services.recaptcha.secret_key');"
```

### 4. Common Issues & Solutions

#### Issue 1: Domain tidak terdaftar di Google reCAPTCHA
**Error**: `invalid-input-secret` atau `invalid-input-response`

**Solution**:
1. Kunjungi [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Edit domain Anda
3. Tambahkan domain yang digunakan:
   - `localhost`
   - `127.0.0.1`
   - Domain produksi Anda

#### Issue 2: Secret key salah
**Error**: `invalid-input-secret`

**Solution**:
1. Copy secret key yang benar dari Google reCAPTCHA Console
2. Update `RECAPTCHA_SECRET_KEY` di backend `.env`
3. Restart backend server

#### Issue 3: Site key salah
**Error**: reCAPTCHA tidak muncul di frontend

**Solution**:
1. Copy site key yang benar dari Google reCAPTCHA Console
2. Update `VITE_RECAPTCHA_SITE_KEY` di frontend `.env`
3. Restart frontend development server

#### Issue 4: Network/Connection issues
**Error**: Timeout atau connection errors

**Solution**:
1. Pastikan server backend bisa mengakses internet
2. Check firewall tidak memblok `https://www.google.com/recaptcha/api/siteverify`
3. Test connection:
   ```bash
   curl -X POST https://www.google.com/recaptcha/api/siteverify \
        -d "secret=YOUR_SECRET&response=test"
   ```

#### Issue 5: Environment variables tidak ter-load
**Error**: `reCAPTCHA secret key not configured`

**Solution**:
1. Clear Laravel config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```
2. Verify `.env` file exists dan readable
3. Check file permissions

### 5. Test with Real Data

**Manual test API:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password",
    "captcha_token": "get_real_token_from_browser"
  }'
```

### 6. Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `missing-input-secret` | Secret key tidak ada | Check RECAPTCHA_SECRET_KEY di .env |
| `invalid-input-secret` | Secret key salah | Verify secret key dari Google Console |
| `missing-input-response` | Token tidak dikirim | Check frontend token generation |
| `invalid-input-response` | Token invalid/expired | User perlu re-check reCAPTCHA |
| `bad-request` | Request format salah | Check API request format |
| `timeout-or-duplicate` | Token expired atau duplikat | User perlu re-check reCAPTCHA |

### 7. Debug Tools

**Check current configuration:**
```bash
# Backend
cd backend && php artisan tinker
> config('services.recaptcha.secret_key')
> app()->environment()

# Frontend
# Buka browser console dan jalankan:
> import.meta.env.VITE_RECAPTCHA_SITE_KEY
```

**Test reCAPTCHA component:**
```javascript
// Di browser console
document.querySelector('.g-recaptcha-response').value
```

## 🚨 Quick Fix

Jika Anda perlu sistem berjalan sementara, Anda bisa disable reCAPTCHA validation:

**Temporary disable (HANYA UNTUK DEVELOPMENT):**
```php
// app/Services/RecaptchaService.php
public function verify(string $token): bool
{
    // Temporarily skip verification
    if (app()->environment('local', 'testing')) {
        return true; // ⚠️ JANGAN DI PRODUCTION!
    }

    // ... existing code
}
```

**INGAT**: Selalu enable kembali reCAPTCHA sebelum deploy ke production!

## 📞 Additional Help

Jika masalah tetap berlanjut:

1. Check Google reCAPTCHA Dashboard untuk analytics
2. Verify domain dan key configuration
3. Test dengan berbagai browser
4. Check SSL certificate jika menggunakan HTTPS
5. Monitor network requests di browser DevTools

**Logs to share when asking for help:**
- Browser console logs
- Laravel logs (backend/storage/logs/laravel.log)
- Network requests dari browser DevTools
- Current environment configuration (tanpa sensitive keys)