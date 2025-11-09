# Setup Google reCAPTCHA untuk Login dan Register

## 1. Mendapatkan Google reCAPTCHA Keys

1. Kunjungi [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Login dengan akun Google Anda
3. Klik "Add a new site"
4. Isi form:
   - **Label**: WFH Attendance System (atau nama proyek Anda)
   - **reCAPTCHA type**: pilih "reCAPTCHA v2" dan "I'm not a robot Checkbox"
   - **Domains**: tambahkan `localhost`, `127.0.0.1`, dan domain produksi Anda
   - Accept terms of service
5. Klik "Submit"
6. Anda akan mendapatkan **Site Key** dan **Secret Key**

## 2. Konfigurasi Environment

### Frontend (.env)
Ganti `your_recaptcha_site_key_here` dengan Site Key dari Google:

```env
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEbQjYy9i2QvVt
```

### Backend (.env)
Ganti `your_recaptcha_secret_key_here` dengan Secret Key dari Google:

```env
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Note**: Keys di atas adalah keys testing yang disediakan oleh Google. Ganti dengan keys Anda untuk produksi.

## 3. Feature yang Telah Ditambahkan

### Frontend:
- ✅ Install `react-google-recaptcha` package
- ✅ Add reCAPTCHA component ke Login form
- ✅ Add reCAPTCHA component ke Register form
- ✅ Add validation untuk reCAPTCHA token
- ✅ Update API calls untuk mengirim captcha token

### Backend:
- ✅ Create `RecaptchaService` untuk verifikasi token
- ✅ Add reCAPTCHA configuration ke services.php
- ✅ Update `LoginController` dengan validasi reCAPTCHA
- ✅ Update `RegisterRequest` dengan validasi reCAPTCHA
- ✅ Add environment variable untuk secret key

## 4. Cara Testing

1. Start backend server:
   ```bash
   cd backend
   php artisan serve
   ```

2. Start frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Buka halaman login/register di browser
4. Anda akan melihat reCAPTCHA checkbox "I'm not a robot"
5. Checklist reCAPTCHA sebelum submit form
6. Jika reCAPTCHA tidak terverifikasi, akan muncul error message

## 5. Troubleshooting

### Error: "Invalid reCAPTCHA site key"
- Pastikan site key di .env frontend benar
- Pastikan domain sudah terdaftar di Google reCAPTCHA console

### Error: "reCAPTCHA verification failed"
- Pastikan secret key di .env backend benar
- Check koneksi internet (backend perlu konek ke Google API)
- Pastikan clock server sudah sinkron

### Error: "Network error"
- Pastikan server backend bisa mengakses https://www.google.com/recaptcha/api/siteverify
- Check firewall settings

## 6. Production Deployment

Untuk production:
1. Ganti site key dan secret key dengan production keys
2. Tambahkan domain produksi ke reCAPTCHA console
3. Pastikan environment variables ter-set dengan benar
4. Test reCAPTCHA di domain produksi