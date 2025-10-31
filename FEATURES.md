# Features & Requirements - WFH Attendance System

## Overview
Aplikasi untuk memantau jam kerja karyawan IT yang WFH dengan sistem check-in/check-out, task tracking, dan pelaporan jam kerja.

**Target Jam Kerja**: 7 jam per hari (dapat dicicil dalam multiple sesi)

---

## User Roles

### 1. Employee (Karyawan)
- Check-in dengan input task list
- Check-out dengan checklist task completion
- Melihat rekap pribadi (jam kerja dan task harian)

### 2. Manager
- Melihat rekap semua karyawan
- Edit/delete data attendance dan task
- Manajemen user (CRUD karyawan)
- Manajemen hari libur
- Manajemen cuti karyawan
- Melihat log aktivitas semua user

---

## Feature 1: Authentication & Authorization

### F1.1 - Login System
**User Story**: Sebagai user (karyawan/manager), saya ingin login dengan username dan password untuk mengakses sistem.

**Requirements**:
- Form login dengan email dan password
- Session-based authentication menggunakan Laravel Sanctum/Breeze
- Remember me functionality
- Error message yang jelas jika login gagal
- Redirect ke dashboard sesuai role setelah login

**Validation Rules**:
```
email: required, email, exists in users table
password: required, min:8
```

**Acceptance Criteria**:
- ✅ User bisa login dengan credentials yang valid
- ✅ User tidak bisa login dengan credentials yang invalid
- ✅ Manager redirect ke manager dashboard
- ✅ Employee redirect ke employee dashboard
- ✅ Login attempt dicatat di activity log

---

## Feature 2: Employee - Check-In

### F2.1 - Check-In dengan Task List
**User Story**: Sebagai karyawan, saya ingin check-in di awal kerja dengan memasukkan list task yang akan dikerjakan.

**Requirements**:
- Button "Check-In" di dashboard employee
- Form untuk input multiple tasks (minimal 1 task, maksimal 10 tasks)
- Simpan waktu check-in otomatis saat submit
- Validasi: tidak bisa check-in jika masih ada sesi check-in aktif
- Task list bisa dinamis (add/remove task fields sebelum submit)

**Validation Rules**:
```
tasks: required, array, min:1, max:10
tasks.*: required, string, max:255
```

**Flow**:
1. Karyawan klik "Check-In"
2. Modal/page muncul dengan form input tasks
3. Karyawan input deskripsi task (bisa tambah/kurang field)
4. Karyawan submit form
5. System create attendance record dengan status "checked_in"
6. System create task records linked ke attendance
7. Redirect ke dashboard dengan notifikasi sukses

**Database Changes**:
```sql
attendances table:
- id
- user_id (FK to users)
- check_in_at (timestamp)
- check_out_at (timestamp, nullable)
- status (enum: checked_in, checked_out, auto_checked_out)
- duration_minutes (integer, default 0)
- is_overtime (boolean, default false)

tasks table:
- id
- attendance_id (FK to attendances)
- description (text)
- is_completed (boolean, default false)
- blocker_reason (text, nullable)
```

**Acceptance Criteria**:
- ✅ Karyawan bisa check-in dengan minimal 1 task
- ✅ Sistem record waktu check-in secara otomatis
- ✅ Karyawan tidak bisa check-in 2x tanpa check-out
- ✅ Task tersimpan dan linked ke attendance session
- ✅ Check-in dicatat di activity log

### F2.2 - Multiple Check-In per Hari (Cicilan)
**User Story**: Sebagai karyawan, saya ingin bisa check-in beberapa kali dalam sehari untuk mencicil 7 jam kerja.

**Requirements**:
- Karyawan bisa check-in lagi setelah check-out
- Setiap check-in baru bisa:
  - Input task baru, ATAU
  - Melanjutkan task yang belum selesai dari sesi sebelumnya, ATAU
  - Kombinasi keduanya
- System hitung total durasi dari semua sesi dalam 1 hari

**Flow untuk Check-In ke-2 dst**:
1. Karyawan klik "Check-In" lagi setelah pernah check-out
2. Form muncul dengan:
   - Input untuk task baru
   - Checkbox list task yang belum selesai dari sesi sebelumnya (optional untuk di-carry forward)
3. Karyawan pilih task lama atau input task baru
4. Submit dan mulai sesi baru

**Acceptance Criteria**:
- ✅ Karyawan bisa check-in multiple kali dalam 1 hari
- ✅ Sistem tampilkan total jam kerja hari ini (dari semua sesi)
- ✅ Karyawan bisa pilih melanjutkan task lama atau buat baru
- ✅ Setiap sesi check-in tercatat terpisah di database

---

## Feature 3: Employee - Check-Out

### F3.1 - Check-Out dengan Task Completion
**User Story**: Sebagai karyawan, saya ingin check-out setelah selesai kerja dengan melakukan checklist task yang sudah dikerjakan.

**Requirements**:
- Button "Check-Out" hanya muncul jika ada sesi check-in aktif
- Form checklist untuk semua task dari sesi check-in aktif
- Setiap task bisa di-mark sebagai completed atau incomplete
- Jika task incomplete, wajib isi alasan/blocker
- Sistem otomatis hitung durasi kerja saat check-out
- Sistem deteksi jika jam kerja > 7 jam (overtime)

**Validation Rules**:
```
tasks: required, array
tasks.*.is_completed: required, boolean
tasks.*.blocker_reason: required_if:tasks.*.is_completed,false, string, max:500
```

**Flow**:
1. Karyawan klik "Check-Out"
2. Form muncul dengan checklist semua task dari sesi ini
3. Karyawan centang task yang selesai
4. Untuk task yang belum selesai, karyawan wajib isi blocker reason
5. Karyawan submit
6. System update attendance record:
   - Set check_out_at = current timestamp
   - Set status = "checked_out"
   - Calculate duration_minutes = check_out_at - check_in_at
   - Set is_overtime = true jika total hari ini > 7 jam
7. System update task records dengan completion status dan blocker
8. Redirect ke dashboard dengan summary jam kerja hari ini

**Acceptance Criteria**:
- ✅ Karyawan bisa check-out dari sesi aktif
- ✅ Semua task harus di-checklist (complete/incomplete)
- ✅ Wajib isi blocker reason jika task incomplete
- ✅ Sistem hitung durasi sesi dengan benar
- ✅ Sistem flag overtime jika total hari ini > 7 jam
- ✅ Check-out dicatat di activity log

### F3.2 - Auto Check-Out (23:59)
**User Story**: Sebagai system admin, saya ingin sistem otomatis check-out karyawan yang lupa check-out di akhir hari.

**Requirements**:
- Scheduled command yang berjalan setiap hari jam 23:59
- Find semua attendance dengan status "checked_in"
- Auto check-out dengan:
  - check_out_at = 23:59
  - status = "auto_checked_out"
  - Hitung duration
- Semua task di-mark sebagai incomplete dengan blocker reason = "Auto check-out oleh sistem"

**Implementation**:
```php
// app/Console/Commands/AutoCheckoutCommand.php
// Scheduled in app/Console/Kernel.php at 23:59 daily
```

**Acceptance Criteria**:
- ✅ Command berjalan setiap hari jam 23:59
- ✅ Semua sesi check-in aktif di-close otomatis
- ✅ Status berubah menjadi "auto_checked_out"
- ✅ Auto check-out dicatat di activity log
- ✅ Email notification ke karyawan (optional)

---

## Feature 4: Employee - Personal Report

### F4.1 - Daily Work Hours Summary
**User Story**: Sebagai karyawan, saya ingin melihat rekap jam kerja saya setiap hari.

**Requirements**:
- Page "Rekap Saya" di menu employee
- Filter berdasarkan tanggal (date picker)
- Tampilkan untuk tanggal yang dipilih:
  - Total jam kerja hari itu
  - Status: Belum tercapai (<7 jam) / Tercapai (=7 jam) / Overtime (>7 jam)
  - List semua sesi check-in/check-out
  - Detail task per sesi dengan status completion
- Default tampilkan data hari ini

**Display Format**:
```
Tanggal: 31 Oktober 2024

Total Jam Kerja: 8.5 jam
Status: Overtime (+1.5 jam)
Target: 7 jam

Sesi 1: 09:00 - 13:00 (4 jam)
✓ Fix bug authentication
✓ Code review PR #123
✗ Unit testing [Blocker: Waiting for QA environment]

Sesi 2: 14:00 - 18:30 (4.5 jam)
✓ Update documentation
✓ Meeting with client
```

**Acceptance Criteria**:
- ✅ Karyawan bisa lihat rekap per tanggal
- ✅ Total jam kerja dihitung dengan benar
- ✅ Status jam kerja ditampilkan dengan jelas
- ✅ Detail sesi dan task terlihat lengkap
- ✅ Blocker reason terlihat untuk task incomplete

### F4.2 - Monthly Work Hours Report
**User Story**: Sebagai karyawan, saya ingin melihat rekap bulanan jam kerja saya.

**Requirements**:
- Filter berdasarkan bulan & tahun
- Tampilkan:
  - Total hari kerja dalam bulan (exclude weekend & holiday)
  - Total jam kerja bulan ini
  - Rata-rata jam kerja per hari
  - Jumlah hari yang tidak mencapai 7 jam
  - Total overtime hours
  - Calendar view dengan color coding:
    - Hijau: ≥ 7 jam
    - Kuning: 4-6.99 jam
    - Merah: < 4 jam
    - Abu-abu: Hari libur/weekend/cuti

**Acceptance Criteria**:
- ✅ Rekap bulanan akurat
- ✅ Calendar view mudah dibaca
- ✅ Statistik ditampilkan dengan jelas
- ✅ Karyawan bisa klik tanggal di calendar untuk lihat detail

---

## Feature 5: Manager - Dashboard & Overview

### F5.1 - Manager Dashboard
**User Story**: Sebagai manager, saya ingin melihat overview real-time dari semua karyawan di dashboard.

**Requirements**:
- Card summary:
  - Total karyawan aktif
  - Karyawan yang sedang check-in (real-time)
  - Karyawan yang sudah mencapai 7 jam hari ini
  - Rata-rata jam kerja tim hari ini
- Tabel karyawan hari ini dengan kolom:
  - Nama
  - Status (Check-in / Check-out / Tidak check-in)
  - Check-in time
  - Check-out time (jika ada)
  - Total jam hari ini
  - Status target (Belum / Tercapai / Overtime)
- Filter: Semua / Check-in / Check-out / Belum check-in
- Search by nama karyawan

**Acceptance Criteria**:
- ✅ Data real-time atau max delay 1 menit
- ✅ Manager bisa filter dan search karyawan
- ✅ Klik nama karyawan untuk lihat detail
- ✅ Summary cards akurat

### F5.2 - Employee Detail Report
**User Story**: Sebagai manager, saya ingin melihat detail attendance dan task dari karyawan tertentu.

**Requirements**:
- Page detail karyawan dengan filter tanggal
- Tampilkan informasi:
  - Profil karyawan (nama, email, role)
  - Total jam kerja (hari ini / periode tertentu)
  - List attendance sessions dengan detail task
  - Chart jam kerja (line chart per hari)
- Action buttons:
  - Edit attendance
  - Delete attendance
  - Export to PDF

**Acceptance Criteria**:
- ✅ Manager bisa lihat detail lengkap
- ✅ Filter tanggal berfungsi
- ✅ Chart tampil dengan benar
- ✅ Action buttons berfungsi sesuai permission

---

## Feature 6: Manager - Attendance Management

### F6.1 - Edit Attendance
**User Story**: Sebagai manager, saya ingin mengedit data attendance karyawan jika ada kesalahan.

**Requirements**:
- Manager bisa edit:
  - Check-in time
  - Check-out time
  - Task descriptions
  - Task completion status
  - Blocker reasons
- Validasi: check-out harus > check-in
- Auto recalculate duration setelah edit
- Wajib isi alasan edit (untuk audit trail)

**Validation Rules**:
```
check_in_at: required, date
check_out_at: nullable, date, after:check_in_at
edit_reason: required, string, max:500
```

**Acceptance Criteria**:
- ✅ Manager bisa edit attendance
- ✅ Duration ter-recalculate otomatis
- ✅ Edit reason wajib diisi
- ✅ Edit dicatat di activity log dengan detail perubahan

### F6.2 - Delete Attendance
**User Story**: Sebagai manager, saya ingin menghapus data attendance yang salah atau duplikat.

**Requirements**:
- Confirmation modal sebelum delete
- Soft delete (data tidak benar-benar dihapus)
- Wajib isi alasan hapus
- Delete cascade ke tasks terkait

**Acceptance Criteria**:
- ✅ Confirmation modal muncul
- ✅ Data ter-soft delete
- ✅ Delete reason wajib diisi
- ✅ Delete dicatat di activity log
- ✅ Task terkait ikut terhapus

---

## Feature 7: Manager - User Management

### F7.1 - View All Users
**User Story**: Sebagai manager, saya ingin melihat list semua karyawan.

**Requirements**:
- Tabel users dengan kolom:
  - ID
  - Nama
  - Email
  - Role
  - Status (Aktif/Nonaktif)
  - Tanggal bergabung
  - Actions (Edit, Delete, Reset Password)
- Search by nama atau email
- Filter by role dan status
- Pagination (25 per page)

**Acceptance Criteria**:
- ✅ List users tampil lengkap
- ✅ Search dan filter berfungsi
- ✅ Pagination berfungsi

### F7.2 - Create User
**User Story**: Sebagai manager, saya ingin menambahkan karyawan baru ke sistem.

**Requirements**:
- Form create user:
  - Nama lengkap
  - Email (unique)
  - Password (auto-generate atau manual)
  - Role (Employee / Manager)
  - Status (Aktif/Nonaktif)
- Email notifikasi ke user baru dengan credentials

**Validation Rules**:
```
name: required, string, max:100
email: required, email, unique:users,email
password: required, min:8, confirmed
role: required, in:employee,manager
```

**Acceptance Criteria**:
- ✅ Manager bisa create user baru
- ✅ Email tidak boleh duplikat
- ✅ Password di-hash dengan bcrypt
- ✅ Email notifikasi terkirim
- ✅ Create dicatat di activity log

### F7.3 - Edit User
**User Story**: Sebagai manager, saya ingin mengedit data karyawan.

**Requirements**:
- Edit: nama, email, role, status
- Password tidak bisa diedit (gunakan reset password)
- Validasi email unique (exclude user yang sedang diedit)

**Acceptance Criteria**:
- ✅ Manager bisa edit user data
- ✅ Email validation correct
- ✅ Edit dicatat di activity log

### F7.4 - Delete User
**User Story**: Sebagai manager, saya ingin menghapus karyawan yang sudah resign.

**Requirements**:
- Soft delete user
- Confirmation modal
- History attendance tetap tersimpan untuk keperluan audit
- User yang di-delete tidak bisa login

**Acceptance Criteria**:
- ✅ User ter-soft delete
- ✅ History attendance tetap ada
- ✅ User tidak bisa login lagi
- ✅ Delete dicatat di activity log

### F7.5 - Reset Password
**User Story**: Sebagai manager, saya ingin reset password karyawan yang lupa.

**Requirements**:
- Auto-generate password baru (random 12 karakter)
- Email password baru ke user
- User wajib ganti password saat first login

**Acceptance Criteria**:
- ✅ Password ter-reset
- ✅ Email terkirim dengan password baru
- ✅ Reset dicatat di activity log

---

## Feature 8: Manager - Holiday Management

### F8.1 - Holiday CRUD
**User Story**: Sebagai manager, saya ingin mengatur hari libur nasional dan perusahaan.

**Requirements**:
- List holidays dengan tanggal dan nama
- Create holiday (nama, tanggal)
- Edit holiday
- Delete holiday
- Import holidays (bulk via CSV)

**Validation Rules**:
```
name: required, string, max:100
date: required, date, unique:holidays,date
```

**Impact**:
- Hari libur tidak dihitung dalam target jam kerja
- Karyawan tidak perlu check-in di hari libur
- Calendar view karyawan tampilkan hari libur

**Acceptance Criteria**:
- ✅ CRUD holiday berfungsi
- ✅ Import CSV berfungsi
- ✅ Hari libur ter-apply ke semua karyawan
- ✅ Changes dicatat di activity log

---

## Feature 9: Manager - Leave Management

### F9.1 - Leave CRUD
**User Story**: Sebagai manager, saya ingin mengatur cuti karyawan.

**Requirements**:
- List leaves dengan kolom:
  - Karyawan
  - Tanggal mulai
  - Tanggal selesai
  - Jumlah hari
  - Alasan
  - Status (Pending/Approved/Rejected)
- Create leave untuk karyawan
- Approve/reject leave
- Delete leave

**Validation Rules**:
```
user_id: required, exists:users,id
start_date: required, date
end_date: required, date, after_or_equal:start_date
reason: required, string, max:500
```

**Impact**:
- Hari cuti tidak dihitung dalam target jam kerja
- Karyawan tidak perlu check-in di hari cuti
- Calendar view karyawan tampilkan hari cuti

**Acceptance Criteria**:
- ✅ Manager bisa manage leave
- ✅ Date range validation correct
- ✅ Hari cuti ter-apply ke karyawan
- ✅ Changes dicatat di activity log

### F9.2 - Leave Request (Optional Enhancement)
**User Story**: Sebagai karyawan, saya ingin mengajukan cuti melalui aplikasi.

**Requirements**:
- Karyawan bisa submit leave request
- Manager dapat notifikasi untuk approve/reject
- Email notifikasi ke karyawan saat approved/rejected

---

## Feature 10: Manager - Activity Log

### F10.1 - View Activity Logs
**User Story**: Sebagai manager, saya ingin melihat semua aktivitas user untuk audit trail.

**Requirements**:
- Tabel activity logs dengan kolom:
  - Timestamp
  - User (nama)
  - Activity type (Check-in, Check-out, Edit, Delete, etc)
  - Description
  - IP Address
  - User Agent
- Filter by:
  - User
  - Activity type
  - Date range
- Search by description
- Export to CSV/Excel
- Pagination (50 per page)

**Activity Types to Log**:
- `CHECK_IN`: Karyawan check-in
- `CHECK_OUT`: Karyawan check-out
- `AUTO_CHECK_OUT`: System auto check-out
- `ATTENDANCE_EDIT`: Manager edit attendance
- `ATTENDANCE_DELETE`: Manager delete attendance
- `TASK_UPDATE`: Update task status
- `USER_CREATE`: Manager create user
- `USER_EDIT`: Manager edit user
- `USER_DELETE`: Manager delete user
- `HOLIDAY_CREATE`: Manager create holiday
- `HOLIDAY_DELETE`: Manager delete holiday
- `LEAVE_CREATE`: Manager create leave
- `LEAVE_APPROVE`: Manager approve leave
- `LOGIN`: User login
- `LOGOUT`: User logout

**Acceptance Criteria**:
- ✅ Semua aktivitas tercatat
- ✅ Filter dan search berfungsi
- ✅ Export berfungsi
- ✅ Log tidak bisa diedit/dihapus

---

## Feature 11: Reports & Analytics (Future Enhancement)

### F11.1 - Team Performance Report
- Average work hours per team/department
- Top performers (most consistent)
- Employees not meeting targets
- Overtime analysis

### F11.2 - Task Analysis
- Most common blockers
- Task completion rate
- Average tasks per day

### F11.3 - Export Reports
- PDF export untuk individual employee
- Excel export untuk bulk data
- Monthly/yearly reports

---

## Business Rules Summary

### Work Hours Calculation
1. **Daily Target**: 7 jam (420 menit)
2. **Overtime**: Jam kerja > 7 jam dalam 1 hari
3. **Multiple Sessions**: Bisa check-in/out berkali-kali, total dihitung kumulatif
4. **No Buffer**: 6.99 jam tetap belum mencapai target

### Check-In Rules
1. Tidak bisa check-in jika ada sesi aktif
2. Minimal 1 task harus diinput
3. Maksimal 10 tasks per sesi
4. Bisa check-in multiple kali per hari

### Check-Out Rules
1. Hanya bisa check-out jika ada sesi aktif
2. Semua task harus di-checklist (complete/incomplete)
3. Task incomplete wajib isi blocker reason
4. Auto check-out jam 23:59 jika lupa check-out

### Holidays & Leaves
1. Hari libur = tidak ada target jam kerja
2. Hari cuti = tidak ada target jam kerja
3. Weekend handling (opsional, tergantung kebijakan)

### Authorization
1. **Employee**: Hanya akses data sendiri
2. **Manager**: Akses semua data, bisa edit/delete

### Activity Logging
1. Semua CRUD operations dicatat
2. Login/logout dicatat
3. Check-in/out dicatat
4. Log include: user, timestamp, IP, user agent
5. Log tidak bisa diedit/dihapus

---

## API Endpoints Reference

### Authentication
- `POST /login` - Login
- `POST /logout` - Logout

### Employee Routes
- `GET /employee/dashboard` - Dashboard karyawan
- `POST /employee/check-in` - Check-in
- `POST /employee/check-out` - Check-out
- `GET /employee/report` - Rekap pribadi
- `GET /employee/report/daily?date={date}` - Rekap harian
- `GET /employee/report/monthly?month={month}&year={year}` - Rekap bulanan

### Manager Routes
- `GET /manager/dashboard` - Dashboard manager
- `GET /manager/employees` - List karyawan dengan attendance hari ini
- `GET /manager/employees/{id}` - Detail karyawan
- `GET /manager/attendances` - List all attendances
- `PUT /manager/attendances/{id}` - Edit attendance
- `DELETE /manager/attendances/{id}` - Delete attendance

### User Management (Manager Only)
- `GET /manager/users` - List users
- `POST /manager/users` - Create user
- `PUT /manager/users/{id}` - Edit user
- `DELETE /manager/users/{id}` - Delete user
- `POST /manager/users/{id}/reset-password` - Reset password

### Holiday Management (Manager Only)
- `GET /manager/holidays` - List holidays
- `POST /manager/holidays` - Create holiday
- `PUT /manager/holidays/{id}` - Edit holiday
- `DELETE /manager/holidays/{id}` - Delete holiday

### Leave Management (Manager Only)
- `GET /manager/leaves` - List leaves
- `POST /manager/leaves` - Create leave
- `PUT /manager/leaves/{id}` - Edit leave
- `DELETE /manager/leaves/{id}` - Delete leave
- `POST /manager/leaves/{id}/approve` - Approve leave
- `POST /manager/leaves/{id}/reject` - Reject leave

### Activity Logs (Manager Only)
- `GET /manager/activity-logs` - List activity logs
- `GET /manager/activity-logs/export` - Export to CSV

---

## Database Schema Summary

### users
```sql
id, name, email, password, role (enum: manager, employee), 
status (enum: active, inactive), remember_token, 
created_at, updated_at, deleted_at
```

### attendances
```sql
id, user_id, check_in_at, check_out_at (nullable),
status (enum: checked_in, checked_out, auto_checked_out),
duration_minutes (default 0), is_overtime (default false),
created_at, updated_at, deleted_at
```

### tasks
```sql
id, attendance_id, description, is_completed (default false),
blocker_reason (nullable), created_at, updated_at
```

### holidays
```sql
id, name, date (unique), created_at, updated_at
```

### leaves
```sql
id, user_id, start_date, end_date, reason,
status (enum: pending, approved, rejected),
approved_by (user_id, nullable), approved_at (nullable),
created_at, updated_at
```

### activity_logs
```sql
id, user_id, activity_type (enum), description,
ip_address, user_agent, created_at
```

---

## UI/UX Guidelines

### Color Coding
- **Green**: Success, target tercapai, completed tasks
- **Yellow**: Warning, mendekati target (4-6.99 jam)
- **Red**: Danger, target tidak tercapai (< 4 jam)
- **Blue**: Info, overtime
- **Gray**: Inactive, holidays, weekends

### Notifications
- Success toast untuk actions yang berhasil
- Error toast untuk validation errors
- Confirmation modal untuk destructive actions (delete)
- Real-time notification untuk manager (optional, using websocket)

### Responsive Design
- Mobile-friendly untuk karyawan check-in/out
- Desktop-optimized untuk manager dashboard & reports
- Tablet support untuk semua features

---

## Performance Targets
- Page load time: < 2 detik
- Check-in/out process: < 1 detik
- Dashboard load: < 3 detik dengan 100+ karyawan
- Report generation: < 5 detik untuk 1 tahun data

## Security Requirements
- HTTPS only
- CSRF protection
- SQL injection prevention
- XSS prevention
- Rate limiting untuk login attempts
- Session timeout (30 menit idle)
- Password hashing dengan bcrypt (cost 12)
