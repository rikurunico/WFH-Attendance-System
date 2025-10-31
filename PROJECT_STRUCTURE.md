# Project Structure - WFH Attendance System

## Tech Stack
- **Backend**: Laravel 11.x
- **Frontend**: React 18.x with Inertia.js
- **Database**: PostgreSQL 15+
- **Authentication**: Laravel Sanctum/Breeze with Inertia
- **Styling**: Tailwind CSS

## Directory Structure

```
app/
├── Console/
│   └── Commands/
│       └── AutoCheckoutCommand.php          # Auto checkout at 23:59
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   └── AuthController.php
│   │   ├── Employee/
│   │   │   ├── AttendanceController.php     # Check-in/out karyawan
│   │   │   ├── TaskController.php           # Manage tasks per sesi
│   │   │   └── ReportController.php         # Rekap pribadi karyawan
│   │   └── Manager/
│   │       ├── DashboardController.php      # Overview semua karyawan
│   │       ├── AttendanceManagementController.php
│   │       ├── UserManagementController.php
│   │       ├── HolidayController.php        # Manage hari libur
│   │       ├── LeaveController.php          # Manage cuti karyawan
│   │       └── ActivityLogController.php
│   ├── Middleware/
│   │   ├── RoleMiddleware.php               # Check role (manager/employee)
│   │   └── LogActivityMiddleware.php        # Auto log semua aktivitas
│   └── Requests/
│       ├── CheckInRequest.php
│       ├── CheckOutRequest.php
│       ├── TaskRequest.php
│       └── UserRequest.php
├── Models/
│   ├── User.php
│   ├── Attendance.php                       # Sesi check-in/out
│   ├── Task.php                             # Task per sesi attendance
│   ├── Holiday.php                          # Hari libur
│   ├── Leave.php                            # Cuti karyawan
│   └── ActivityLog.php                      # Log semua aktivitas
├── Services/
│   ├── AttendanceService.php                # Business logic attendance
│   ├── TaskService.php                      # Business logic tasks
│   ├── WorkHourCalculationService.php       # Hitung jam kerja & overtime
│   └── ActivityLogService.php               # Log activities
├── Repositories/
│   ├── AttendanceRepository.php
│   ├── TaskRepository.php
│   ├── UserRepository.php
│   └── ActivityLogRepository.php
└── Enums/
    ├── RoleEnum.php                         # MANAGER, EMPLOYEE
    ├── AttendanceStatusEnum.php             # CHECKED_IN, CHECKED_OUT, AUTO_CHECKED_OUT
    ├── TaskStatusEnum.php                   # COMPLETED, INCOMPLETE
    └── ActivityTypeEnum.php                 # CHECK_IN, CHECK_OUT, TASK_UPDATE, etc.

database/
├── migrations/
│   ├── 2024_01_01_000000_create_users_table.php
│   ├── 2024_01_01_000001_create_attendances_table.php
│   ├── 2024_01_01_000002_create_tasks_table.php
│   ├── 2024_01_01_000003_create_holidays_table.php
│   ├── 2024_01_01_000004_create_leaves_table.php
│   └── 2024_01_01_000005_create_activity_logs_table.php
├── seeders/
│   ├── RoleSeeder.php
│   ├── UserSeeder.php                       # Create default manager
│   └── HolidaySeeder.php                    # Hari libur nasional
└── factories/

resources/
└── js/
    ├── Pages/
    │   ├── Auth/
    │   │   └── Login.jsx
    │   ├── Employee/
    │   │   ├── Dashboard.jsx               # Dashboard karyawan
    │   │   ├── CheckIn.jsx                 # Form check-in + input tasks
    │   │   ├── CheckOut.jsx                # Form check-out + checklist tasks
    │   │   └── Report.jsx                  # Rekap pribadi
    │   └── Manager/
    │       ├── Dashboard.jsx               # Dashboard manager
    │       ├── Attendance/
    │       │   ├── Index.jsx               # List attendance semua karyawan
    │       │   └── Show.jsx                # Detail attendance per karyawan
    │       ├── Users/
    │       │   ├── Index.jsx
    │       │   ├── Create.jsx
    │       │   └── Edit.jsx
    │       ├── Holidays/
    │       │   └── Index.jsx
    │       ├── Leaves/
    │       │   └── Index.jsx
    │       └── ActivityLogs/
    │           └── Index.jsx
    ├── Components/
    │   ├── Layout/
    │   │   ├── AppLayout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Navbar.jsx
    │   ├── Attendance/
    │   │   ├── AttendanceCard.jsx
    │   │   ├── TaskList.jsx
    │   │   └── WorkHourSummary.jsx
    │   └── Common/
    │       ├── DataTable.jsx
    │       ├── Modal.jsx
    │       └── DatePicker.jsx
    └── Hooks/
        ├── useAttendance.js
        ├── useWorkHours.js
        └── useActivityLog.js

routes/
├── web.php                                  # Inertia routes
└── console.php                              # Scheduled commands

config/
└── attendance.php                           # Config jam kerja, overtime, dll
```

## Database Schema Overview

### users
- id, name, email, password, role (manager/employee), created_at, updated_at

### attendances
- id, user_id, check_in_at, check_out_at, status (checked_in/checked_out/auto_checked_out), duration_minutes, is_overtime, created_at, updated_at

### tasks
- id, attendance_id, description, is_completed, blocker_reason (nullable), created_at, updated_at

### holidays
- id, name, date, created_at, updated_at

### leaves
- id, user_id, start_date, end_date, reason, approved_by (user_id manager), created_at, updated_at

### activity_logs
- id, user_id, activity_type, description, ip_address, user_agent, created_at

## Design Patterns

### Repository Pattern
Semua database queries dilakukan melalui Repository untuk memisahkan data access logic.

### Service Layer
Business logic berada di Service layer, Controller hanya handle request/response.

### Middleware Pattern
- RoleMiddleware: Proteksi route berdasarkan role
- LogActivityMiddleware: Auto logging setiap request

## Key Features Implementation

### 1. Auto Checkout (23:59)
```
Console/Commands/AutoCheckoutCommand.php
- Scheduled daily at 23:59
- Find all checked_in attendances
- Auto checkout dengan status 'auto_checked_out'
- Log activity
```

### 2. Work Hour Calculation
```
WorkHourCalculationService.php
- Calculate total duration per day
- Track cumulative hours (support cicilan)
- Flag overtime (> 7 hours)
- Daily target: 420 minutes (7 hours)
```

### 3. Activity Logging
```
ActivityLogService.php
- Log semua CRUD operations
- Track check-in/out
- Track task updates
- Store IP & User Agent
```

## Environment Variables
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wfh_attendance
DB_USERNAME=postgres
DB_PASSWORD=

DAILY_WORK_HOURS=7
AUTO_CHECKOUT_TIME=23:59
```

## Development Workflow
1. Backend development di `app/` dengan Service & Repository pattern
2. Frontend development di `resources/js/` dengan React + Inertia
3. Shared types di `resources/js/types/` untuk TypeScript (optional)
4. Testing di `tests/Feature/` untuk integration tests
