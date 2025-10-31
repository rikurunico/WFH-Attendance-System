# PROJECT STRUCTURE

## Overview
This is a WFH (Work From Home) Employee Attendance & Task Tracking System with separated frontend (React) and backend (Laravel 12) architecture for scalability.

## Technology Stack

### Backend
- **Framework**: Laravel 12
- **Database**: PostgreSQL
- **Authentication**: Laravel Sanctum (SPA Authentication)
- **API**: RESTful API
- **PHP Version**: 8.2+

### Frontend
- **Framework**: React 18+
- **State Management**: React Context API / Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Framework**: TailwindCSS + Shadcn/ui (or your preferred UI library)
- **Form Management**: React Hook Form
- **Date/Time**: date-fns or day.js

## Project Structure

### Backend Structure (Laravel)
```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── AutoCheckoutCommand.php          # Cron job for auto checkout at 23:59
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginController.php
│   │   │   │   │   └── LogoutController.php
│   │   │   │   ├── AttendanceController.php     # Check-in/Check-out endpoints
│   │   │   │   ├── TaskController.php           # Task CRUD operations
│   │   │   │   ├── EmployeeReportController.php # Employee's own reports
│   │   │   │   ├── ManagerReportController.php  # Manager's dashboard reports
│   │   │   │   ├── UserManagementController.php # User CRUD (Manager only)
│   │   │   │   ├── HolidayController.php        # Holiday management
│   │   │   │   ├── LeaveController.php          # Leave/Cuti management
│   │   │   │   └── ActivityLogController.php    # View activity logs
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php                    # Role-based access control
│   │   │   └── LogUserActivity.php              # Middleware to log all activities
│   │   ├── Requests/
│   │   │   ├── CheckInRequest.php
│   │   │   ├── CheckOutRequest.php
│   │   │   ├── TaskRequest.php
│   │   │   └── UserRequest.php
│   │   └── Resources/
│   │       ├── AttendanceResource.php
│   │       ├── TaskResource.php
│   │       ├── UserResource.php
│   │       └── ActivityLogResource.php
│   ├── Models/
│   │   ├── User.php                             # id, name, email, password, role (enum: manager, employee)
│   │   ├── Attendance.php                       # id, user_id, check_in, check_out, date, total_hours
│   │   ├── Task.php                             # id, attendance_id, title, is_completed, blocker_reason
│   │   ├── Holiday.php                          # id, date, name, description
│   │   ├── Leave.php                            # id, user_id, start_date, end_date, reason, status
│   │   └── ActivityLog.php                      # id, user_id, action, description, ip_address, user_agent
│   ├── Services/
│   │   ├── AttendanceService.php                # Business logic for attendance
│   │   ├── TaskService.php                      # Business logic for tasks
│   │   ├── ReportService.php                    # Generate reports and statistics
│   │   └── ActivityLogService.php               # Log user activities
│   ├── Repositories/
│   │   ├── AttendanceRepository.php
│   │   ├── TaskRepository.php
│   │   ├── UserRepository.php
│   │   └── ActivityLogRepository.php
│   └── Enums/
│       ├── UserRole.php                         # Enum: MANAGER, EMPLOYEE
│       ├── LeaveStatus.php                      # Enum: PENDING, APPROVED, REJECTED
│       └── ActivityType.php                     # Enum: CHECK_IN, CHECK_OUT, TASK_CREATED, etc.
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_attendances_table.php
│   │   ├── 2024_01_01_000003_create_tasks_table.php
│   │   ├── 2024_01_01_000004_create_holidays_table.php
│   │   ├── 2024_01_01_000005_create_leaves_table.php
│   │   └── 2024_01_01_000006_create_activity_logs_table.php
│   ├── seeders/
│   │   ├── UserSeeder.php                       # Seed default manager and employees
│   │   └── HolidaySeeder.php                    # Seed common holidays
│   └── factories/
│       ├── UserFactory.php
│       └── AttendanceFactory.php
├── routes/
│   └── api.php                                  # All API routes with versioning (v1)
└── tests/
    ├── Feature/
    │   ├── AttendanceTest.php
    │   ├── TaskTest.php
    │   └── AuthTest.php
    └── Unit/
        ├── AttendanceServiceTest.php
        └── ReportServiceTest.php
```

### Frontend Structure (React)
```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js                             # Axios instance with interceptors
│   │   ├── auth.api.js                          # Authentication API calls
│   │   ├── attendance.api.js                    # Attendance API calls
│   │   ├── task.api.js                          # Task API calls
│   │   ├── report.api.js                        # Report API calls
│   │   ├── user.api.js                          # User management API calls
│   │   ├── holiday.api.js                       # Holiday API calls
│   │   ├── leave.api.js                         # Leave API calls
│   │   └── activityLog.api.js                   # Activity log API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── PrivateRoute.jsx                 # Route guard for authentication
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── attendance/
│   │   │   ├── CheckInModal.jsx
│   │   │   ├── CheckOutModal.jsx
│   │   │   └── AttendanceCard.jsx
│   │   ├── task/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   └── TaskForm.jsx
│   │   ├── report/
│   │   │   ├── EmployeeReport.jsx
│   │   │   ├── ManagerDashboard.jsx
│   │   │   ├── AttendanceChart.jsx
│   │   │   └── WorkHoursChart.jsx
│   │   └── admin/
│   │       ├── UserManagement.jsx
│   │       ├── HolidayManagement.jsx
│   │       ├── LeaveManagement.jsx
│   │       └── ActivityLogViewer.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx                      # Authentication context
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useAttendance.js
│   │   └── useReport.js
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── employee/
│   │   │   ├── Dashboard.jsx                    # Check-in/out, today's tasks
│   │   │   ├── MyReport.jsx                     # Personal work history
│   │   │   └── MyLeave.jsx                      # Request leave
│   │   └── manager/
│   │       ├── Dashboard.jsx                    # Overview all employees
│   │       ├── EmployeeList.jsx                 # Manage employees
│   │       ├── Reports.jsx                      # Detailed reports
│   │       ├── HolidaySettings.jsx              # Holiday management
│   │       ├── LeaveApproval.jsx                # Approve/reject leave
│   │       └── ActivityLogs.jsx                 # View all activity logs
│   ├── utils/
│   │   ├── dateHelpers.js                       # Date formatting and calculations
│   │   ├── validators.js                        # Form validation helpers
│   │   └── constants.js                         # App constants (roles, status, etc.)
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx                               # All application routes
├── .env.example
├── package.json
└── vite.config.js
```

## Database Schema Overview

### Tables and Relationships

1. **users**
   - Primary table for authentication
   - Fields: id, name, email, password, role, created_at, updated_at

2. **attendances**
   - Stores check-in and check-out records
   - Fields: id, user_id, check_in, check_out, date, total_hours, created_at, updated_at
   - Relationship: belongsTo User, hasMany Tasks

3. **tasks**
   - Stores tasks for each attendance session
   - Fields: id, attendance_id, title, is_completed, blocker_reason, created_at, updated_at
   - Relationship: belongsTo Attendance

4. **holidays**
   - Stores company holidays
   - Fields: id, date, name, description, created_at, updated_at

5. **leaves**
   - Stores employee leave requests
   - Fields: id, user_id, start_date, end_date, reason, status, created_at, updated_at
   - Relationship: belongsTo User

6. **activity_logs**
   - Stores all user activities for audit trail
   - Fields: id, user_id, action, description, ip_address, user_agent, created_at
   - Relationship: belongsTo User

## Key Design Patterns

### Backend Patterns
- **Repository Pattern**: Separate data access logic from business logic
- **Service Layer**: Contains business logic and orchestrates repository calls
- **Resource Pattern**: Transform models into JSON responses
- **Middleware Pattern**: Handle cross-cutting concerns (auth, logging, CORS)

### Frontend Patterns
- **Component Composition**: Reusable UI components
- **Custom Hooks**: Encapsulate reusable logic
- **Context API**: Global state management for authentication
- **API Service Layer**: Centralized API calls

## API Versioning
All API endpoints are versioned using URL path:
- Base URL: `http://localhost:8000/api/v1`
- Example: `http://localhost:8000/api/v1/attendance/check-in`

## Authentication Flow
1. User logs in → Backend validates credentials
2. Backend generates Sanctum token
3. Frontend stores token in localStorage
4. All subsequent requests include token in Authorization header
5. Backend validates token on each request
6. Frontend redirects to login if token is invalid/expired

## Auto Checkout System
- Laravel Scheduler runs daily at 23:59
- Command: `php artisan attendance:auto-checkout`
- Checks all attendances without check_out for current date
- Auto-fills check_out with 23:59:59
- Calculates total_hours
- Logs activity

## Environment Variables

### Backend (.env)
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wfh_attendance
DB_USERNAME=postgres
DB_PASSWORD=password

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME="WFH Attendance System"
```

## Deployment Considerations
- Backend: Deploy to VPS with PHP 8.2+, PostgreSQL, Nginx
- Frontend: Build with `npm run build`, deploy to Netlify/Vercel or same VPS
- Use environment-specific .env files
- Enable CORS properly in Laravel for production domain
- Set up SSL certificates for both domains
- Configure Laravel Scheduler cron job for auto-checkout
