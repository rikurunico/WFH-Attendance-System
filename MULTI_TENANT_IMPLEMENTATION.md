# Multi-Tenant Implementation Summary

## Overview
Sistem WFH Attendance telah diupgrade menjadi multi-tenant, memungkinkan beberapa tim untuk menggunakan aplikasi secara independen dengan pengaturan masing-masing.

## Perubahan Utama

### 1. Database Changes

#### New Tables
- **teams**: Menyimpan informasi tim
  - `id`, `name`, `slug`, `description`, `is_active`
  - `required_work_hours` (default: 7.00)
  - `default_leave_quota_days` (default: 12)
  - `max_leave_days_per_month` (default: 5)

#### Modified Tables
- **users**: Ditambahkan kolom `team_id` (foreign key ke teams)

### 2. Backend Changes

#### New Models
- `Team` model dengan relasi ke User

#### New Controllers
- `RegisterController`: Handle registrasi manager baru dengan tim
- `TeamSettingsController`: Manage pengaturan tim

#### New Middleware
- `EnsureTeamAccess`: Memastikan user hanya bisa akses data tim mereka sendiri

#### Updated Repositories
- `UserRepository`: Filter by team_id
- `AttendanceRepository`: Filter by team_id melalui user relationship

#### Updated Controllers
- `UserManagementController`: Semua operasi CRUD sekarang filter by team
- Semua manager controllers sekarang menggunakan team context

#### New Routes
```php
// Public routes
POST /api/v1/auth/register

// Protected routes (Manager only)
GET  /api/v1/team/settings
PUT  /api/v1/team/settings
```

#### Middleware Stack
Semua protected routes sekarang menggunakan:
```php
['auth:sanctum', 'log.user.activity', EnsureTeamAccess::class]
```

### 3. Frontend Changes

#### New Pages
- `/register`: Halaman registrasi untuk manager baru
- `/manager/team-settings`: Halaman pengaturan tim

#### New API Functions
- `register()` di `auth.api.js`
- `getTeamSettings()` dan `updateTeamSettings()` di `team.api.js`

#### Updated Components
- `Login.jsx`: Ditambahkan link ke halaman registrasi
- `Sidebar.jsx`: Ditambahkan menu "Pengaturan Tim"
- `App.jsx`: Ditambahkan routes untuk register dan team settings

## Fitur Baru

### 1. Self-Registration untuk Manager
- Manager bisa mendaftar sendiri dan membuat tim baru
- Saat registrasi, manager bisa mengatur:
  - Nama tim dan deskripsi
  - Jam kerja wajib per hari
  - Jatah cuti tahunan default
  - Maksimal cuti per bulan

### 2. Dynamic Team Settings
- Manager bisa mengubah pengaturan tim kapan saja
- Pengaturan yang bisa diubah:
  - Nama dan deskripsi tim
  - `required_work_hours`: Jam kerja wajib per hari
  - `default_leave_quota_days`: Jatah cuti tahunan untuk karyawan baru
  - `max_leave_days_per_month`: Batas maksimal cuti per bulan

### 3. Team Isolation
- Setiap tim memiliki data yang terisolasi
- Manager hanya bisa melihat dan mengelola:
  - User dalam tim mereka
  - Attendance dari user tim mereka
  - Leave requests dari user tim mereka
  - Holiday untuk tim mereka
  - Activity logs tim mereka

## Migration Guide

### Untuk Existing Users
Jika ada user yang sudah ada sebelum implementasi multi-tenant:

1. Buat tim default:
```sql
INSERT INTO teams (name, slug, required_work_hours, default_leave_quota_days, max_leave_days_per_month, created_at, updated_at)
VALUES ('Default Team', 'default-team', 7.00, 12, 5, NOW(), NOW());
```

2. Update existing users:
```sql
UPDATE users SET team_id = 1 WHERE team_id IS NULL;
```

### Untuk New Installation
Tidak perlu migration khusus. User pertama yang register akan otomatis membuat tim.

## Environment Variables (Deprecated)
Pengaturan berikut sekarang dikelola per-tim, bukan global:
- ~~`REQUIRED_WORK_HOURS`~~ → `teams.required_work_hours`
- ~~`DEFAULT_LEAVE_QUOTA_DAYS`~~ → `teams.default_leave_quota_days`
- ~~`MAX_LEAVE_DAYS_PER_MONTH`~~ → `teams.max_leave_days_per_month`

## Security Considerations

### Team Isolation
- Middleware `EnsureTeamAccess` memastikan user tidak bisa akses data tim lain
- Semua query di repository sudah di-filter by team_id
- Authorization check di controller untuk operasi sensitive

### Registration
- Registrasi terbuka untuk manager baru
- Setiap registrasi membuat tim baru
- Tidak ada batasan jumlah tim yang bisa dibuat

## Testing Notes

### Backend Tests
Tests perlu diupdate untuk:
1. Include team_id dalam factory dan seeder
2. Test team isolation
3. Test team settings CRUD
4. Test registration flow

### Frontend Tests
Tests perlu diupdate untuk:
1. Test registration form
2. Test team settings page
3. Test team context dalam semua pages

## Known Limitations

1. **Leave Quota Update**: Perubahan `default_leave_quota_days` hanya berlaku untuk karyawan baru. Karyawan existing tetap menggunakan quota yang sudah ditetapkan.

2. **Work Hours Update**: Perubahan `required_work_hours` berlaku untuk semua perhitungan attendance baru, tapi tidak mengubah data historical.

3. **Team Deletion**: Belum ada fitur untuk menghapus tim. Jika perlu, bisa dilakukan manual via database.

## Future Enhancements

1. **Team Invitation**: Fitur untuk invite user ke tim existing
2. **Team Transfer**: Fitur untuk transfer user antar tim
3. **Team Analytics**: Dashboard untuk compare performance antar tim
4. **Team Billing**: Sistem billing per tim
5. **Team Roles**: Role tambahan selain manager dan employee
6. **Team Deactivation**: Fitur untuk non-aktifkan tim tanpa delete data

## API Documentation Updates

Semua endpoint yang sebelumnya return semua data, sekarang hanya return data untuk tim user yang login.

### New Endpoints

#### POST /api/v1/auth/register
Register manager baru dengan tim baru.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "team_name": "PT. Example",
  "team_description": "Tim Development",
  "required_work_hours": 7,
  "default_leave_quota_days": 12,
  "max_leave_days_per_month": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "...",
    "team": {...}
  },
  "message": "Registrasi berhasil! Tim Anda telah dibuat."
}
```

#### GET /api/v1/team/settings
Get pengaturan tim current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "PT. Example",
    "slug": "pt-example",
    "description": "Tim Development",
    "required_work_hours": 7.00,
    "default_leave_quota_days": 12,
    "max_leave_days_per_month": 5,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

#### PUT /api/v1/team/settings
Update pengaturan tim.

**Request:**
```json
{
  "name": "PT. Example Updated",
  "description": "Tim Development & Design",
  "required_work_hours": 8,
  "default_leave_quota_days": 15,
  "max_leave_days_per_month": 7
}
```

## Deployment Checklist

- [x] Run migrations
- [ ] Update existing users with team_id (if any)
- [ ] Update environment variables documentation
- [ ] Test registration flow
- [ ] Test team settings
- [ ] Test team isolation
- [ ] Update user documentation
- [ ] Update API documentation

## Rollback Plan

Jika perlu rollback:

1. Backup database
2. Drop new migrations:
```bash
php artisan migrate:rollback --step=2
```
3. Restore previous code version
4. Remove team-related routes and middleware

## Support

Untuk pertanyaan atau issue terkait multi-tenant implementation, silakan buat issue di repository atau hubungi tim development.
