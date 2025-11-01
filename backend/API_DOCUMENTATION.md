# WFH Attendance System - API Documentation

## Base Information

- **Base URL**: `http://localhost:8000/api/v1`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: Laravel Sanctum (Bearer Token)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Attendance Endpoints](#attendance-endpoints)
3. [Task Endpoints](#task-endpoints)
4. [Employee Reports](#employee-reports)
5. [Leave Management](#leave-management)
6. [Holiday Management](#holiday-management)
7. [Manager Endpoints](#manager-endpoints)
8. [User Management](#user-management)
9. [Activity Logs](#activity-logs)
10. [Error Responses](#error-responses)

---

## Authentication

### Login

Authenticate user and receive access token.

**Endpoint:** `POST /api/v1/auth/login`

**Authentication Required:** No

**Request Body:**
```json
{
    "email": "employee@example.com",
    "password": "password123"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "employee@example.com",
            "role": "employee",
            "created_at": "2024-01-15T10:00:00.000000Z"
        },
        "token": "1|xyz123abc456..."
    },
    "message": "Login successful"
}
```

**Response (401 Unauthorized):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

**Response (422 Validation Error):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password field is required."]
    }
}
```

---

### Logout

Revoke current access token.

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication Required:** Yes (Bearer Token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

## Attendance Endpoints

All attendance endpoints require **Employee** role.

### Check-In

Check in for work session with tasks.

**Endpoint:** `POST /api/v1/attendance/check-in`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Request Body:**
```json
{
    "tasks": [
        {
            "title": "Implement user authentication module"
        },
        {
            "title": "Fix bug in report generation"
        },
        {
            "title": "Review pull requests"
        }
    ]
}
```

**Validation Rules:**
- `tasks`: required, array, minimum 1 task, maximum 20 tasks
- `tasks.*.title`: required, string, maximum 255 characters

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "user_id": 1,
        "check_in": "2024-01-15T09:00:00.000000Z",
        "check_out": null,
        "date": "2024-01-15",
        "total_hours": 0,
        "tasks": [
            {
                "id": 1,
                "attendance_id": 123,
                "title": "Implement user authentication module",
                "is_completed": false,
                "blocker_reason": null
            },
            {
                "id": 2,
                "attendance_id": 123,
                "title": "Fix bug in report generation",
                "is_completed": false,
                "blocker_reason": null
            }
        ]
    },
    "message": "Checked in successfully"
}
```

**Response (422 Validation Error):**
```json
{
    "success": false,
    "message": "You have already checked in. Please check out first."
}
```

**Business Rules:**
- User cannot check-in if they have an active check-in session
- Cannot check-in on holidays
- Cannot check-in when on approved leave
- Multiple check-ins per day are allowed (installment system)

---

### Check-Out

Check out from work session and update task statuses.

**Endpoint:** `POST /api/v1/attendance/check-out`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Request Body:**
```json
{
    "attendance_id": 123,
    "tasks": [
        {
            "id": 1,
            "is_completed": true,
            "blocker_reason": null
        },
        {
            "id": 2,
            "is_completed": false,
            "blocker_reason": "Waiting for API credentials from third-party vendor"
        },
        {
            "id": 3,
            "is_completed": true,
            "blocker_reason": null
        }
    ]
}
```

**Validation Rules:**
- `attendance_id`: required, exists in database
- `tasks`: required, array
- `tasks.*.id`: required, exists in database, belongs to attendance
- `tasks.*.is_completed`: required, boolean
- `tasks.*.blocker_reason`: required if `is_completed` is false, string, maximum 500 characters

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "user_id": 1,
        "check_in": "2024-01-15T09:00:00.000000Z",
        "check_out": "2024-01-15T16:30:00.000000Z",
        "date": "2024-01-15",
        "total_hours": 7.5,
        "tasks": [
            {
                "id": 1,
                "attendance_id": 123,
                "title": "Implement user authentication module",
                "is_completed": true,
                "blocker_reason": null
            },
            {
                "id": 2,
                "attendance_id": 123,
                "title": "Fix bug in report generation",
                "is_completed": false,
                "blocker_reason": "Waiting for API credentials from third-party vendor"
            }
        ]
    },
    "message": "Checked out successfully. Total hours: 7.5"
}
```

**Business Rules:**
- Must have active check-in session to check-out
- Total hours are automatically calculated
- Daily work requirement: 7 hours minimum

---

### Get Today's Status

Get current work status for today.

**Endpoint:** `GET /api/v1/attendance/today`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "date": "2024-01-15",
        "is_checked_in": true,
        "current_session": {
            "id": 123,
            "check_in": "2024-01-15T14:00:00.000000Z",
            "elapsed_hours": 2.5
        },
        "today_total_hours": 6.5,
        "required_hours": 7,
        "remaining_hours": 0.5,
        "previous_sessions": [
            {
                "check_in": "2024-01-15T09:00:00.000000Z",
                "check_out": "2024-01-15T13:00:00.000000Z",
                "total_hours": 4.0
            }
        ]
    }
}
```

---

## Task Endpoints

All task endpoints require **Employee** role.

### Add Tasks to Active Session

Add new tasks to an active attendance session.

**Endpoint:** `POST /api/v1/tasks/add`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Request Body:**
```json
{
    "attendance_id": 123,
    "tasks": [
        {
            "title": "Emergency bug fix for production issue"
        }
    ]
}
```

**Validation Rules:**
- `attendance_id`: required, exists in database
- `tasks`: required, array, minimum 1 task
- `tasks.*.title`: required, string, maximum 255 characters

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "tasks": [
            {
                "id": 4,
                "attendance_id": 123,
                "title": "Emergency bug fix for production issue",
                "is_completed": false,
                "blocker_reason": null
            }
        ]
    },
    "message": "Tasks added successfully"
}
```

---

### Get Incomplete Tasks

Get all incomplete tasks for the authenticated user.

**Endpoint:** `GET /api/v1/tasks/incomplete`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 2,
            "attendance_id": 123,
            "title": "Fix bug in report generation",
            "is_completed": false,
            "blocker_reason": "Waiting for API credentials"
        }
    ]
}
```

---

## Employee Reports

Requires **Employee** role.

### Get Personal Work Report

Get personal work report with statistics.

**Endpoint:** `GET /api/v1/reports/my-report`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Query Parameters:**
- `start_date` (optional): Date in format `Y-m-d` (default: start of current month)
- `end_date` (optional): Date in format `Y-m-d` (default: today)

**Example Request:**
```
GET /api/v1/reports/my-report?start_date=2024-01-01&end_date=2024-01-31
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "summary": {
            "total_days_worked": 22,
            "total_hours": 154.5,
            "average_hours_per_day": 7.02,
            "required_hours": 154,
            "overtime_hours": 0.5,
            "incomplete_days": 0,
            "task_completion_rate": 95.5
        },
        "attendances": [
            {
                "date": "2024-01-15",
                "sessions": [
                    {
                        "check_in": "2024-01-15T09:00:00.000000Z",
                        "check_out": "2024-01-15T16:30:00.000000Z",
                        "total_hours": 7.5,
                        "tasks_completed": 2,
                        "tasks_incomplete": 1
                    }
                ],
                "daily_total_hours": 7.5,
                "status": "complete"
            },
            {
                "date": "2024-01-16",
                "sessions": [
                    {
                        "check_in": "2024-01-16T08:00:00.000000Z",
                        "check_out": "2024-01-16T12:00:00.000000Z",
                        "total_hours": 4.0,
                        "tasks_completed": 1,
                        "tasks_incomplete": 0
                    },
                    {
                        "check_in": "2024-01-16T14:00:00.000000Z",
                        "check_out": "2024-01-16T17:00:00.000000Z",
                        "total_hours": 3.0,
                        "tasks_completed": 2,
                        "tasks_incomplete": 0
                    }
                ],
                "daily_total_hours": 7.0,
                "status": "complete"
            }
        ]
    }
}
```

**Status Values:**
- `complete`: Daily total hours ≥ 7.0
- `incomplete`: Daily total hours < 7.0
- `overtime`: Daily total hours > 7.0

---

## Leave Management

### Request Leave (Employee)

**Endpoint:** `POST /api/v1/leaves`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Request Body:**
```json
{
    "start_date": "2024-02-01",
    "end_date": "2024-02-03",
    "reason": "Family emergency - need to travel to hometown"
}
```

**Validation Rules:**
- `start_date`: required, date, must be today or future date
- `end_date`: required, date, must be >= start_date
- `reason`: required, string, minimum 10 characters, maximum 500 characters

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "employee@example.com",
            "role": "employee"
        },
        "start_date": "2024-02-01",
        "end_date": "2024-02-03",
        "reason": "Family emergency - need to travel to hometown",
        "status": "pending",
        "approved_by": null,
        "approver": null,
        "approved_at": null,
        "notes": null,
        "requested_at": "2024-01-15T10:00:00.000000Z"
    },
    "message": "Leave request submitted successfully"
}
```

---

### Get My Leave Requests (Employee)

**Endpoint:** `GET /api/v1/leaves/my-requests`

**Authentication Required:** Yes (Bearer Token + Employee Role)

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "start_date": "2024-02-01",
            "end_date": "2024-02-03",
            "reason": "Family emergency",
            "status": "pending",
            "approved_by": null,
            "approved_at": null,
            "notes": null,
            "requested_at": "2024-01-15T10:00:00.000000Z"
        }
    ]
}
```

---

## Holiday Management

### Get Holidays (Both Roles)

**Endpoint:** `GET /api/v1/holidays`

**Authentication Required:** Yes (Bearer Token)

**Query Parameters:**
- `year` (optional): Year to filter holidays (default: current year)

**Example Request:**
```
GET /api/v1/holidays?year=2024
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "date": "2024-01-01",
            "name": "New Year's Day",
            "description": "New Year celebration"
        },
        {
            "id": 2,
            "date": "2024-12-25",
            "name": "Christmas Day",
            "description": "Christmas celebration"
        }
    ]
}
```

---

## Manager Endpoints

All manager endpoints require **Manager** role.

### Manager Dashboard

Get overview of all employees' attendance status.

**Endpoint:** `GET /api/v1/manager/dashboard`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Query Parameters:**
- `date` (optional): Date in format `Y-m-d` (default: today)

**Example Request:**
```
GET /api/v1/manager/dashboard?date=2024-01-15
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "summary": {
            "total_employees": 10,
            "checked_in_now": 7,
            "on_leave": 1,
            "average_daily_hours": 7.2
        },
        "employees": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "status": "checked_in",
                "current_session": {
                    "check_in": "2024-01-15T09:00:00.000000Z",
                    "elapsed_hours": 3.5
                },
                "today_total_hours": 3.5,
                "week_total_hours": 28.0,
                "month_total_hours": 140.5
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "email": "jane@example.com",
                "status": "checked_out",
                "current_session": null,
                "today_total_hours": 7.0,
                "week_total_hours": 35.0,
                "month_total_hours": 154.0
            },
            {
                "id": 3,
                "name": "Bob Wilson",
                "email": "bob@example.com",
                "status": "on_leave",
                "leave": {
                    "start_date": "2024-01-15",
                    "end_date": "2024-01-17",
                    "reason": "Medical leave"
                },
                "today_total_hours": 0,
                "week_total_hours": 28.0,
                "month_total_hours": 126.0
            }
        ]
    }
}
```

**Status Values:**
- `checked_in`: Currently has active check-in
- `checked_out`: Not currently checked in
- `on_leave`: On approved leave for the date

---

### Get Employee Report (Manager)

Get detailed report for any employee.

**Endpoint:** `GET /api/v1/manager/reports/employee/{userId}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**URL Parameters:**
- `userId`: Employee user ID

**Query Parameters:**
- `start_date` (optional): Date in format `Y-m-d`
- `end_date` (optional): Date in format `Y-m-d`

**Example Request:**
```
GET /api/v1/manager/reports/employee/1?start_date=2024-01-01&end_date=2024-01-31
```

**Response:** Same format as Employee Personal Report

---

### List All Attendances (Manager)

**Endpoint:** `GET /api/v1/manager/attendances`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Query Parameters:**
- `start_date` (optional): Date in format `Y-m-d`
- `end_date` (optional): Date in format `Y-m-d`

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 123,
            "user_id": 1,
            "check_in": "2024-01-15T09:00:00.000000Z",
            "check_out": "2024-01-15T17:00:00.000000Z",
            "date": "2024-01-15",
            "total_hours": 8.0,
            "tasks": [
                {
                    "id": 1,
                    "attendance_id": 123,
                    "title": "Task 1",
                    "is_completed": true,
                    "blocker_reason": null
                }
            ],
            "user": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "employee"
            }
        }
    ]
}
```

---

### Edit Attendance (Manager)

Edit attendance record with reason for audit.

**Endpoint:** `PUT /api/v1/manager/attendances/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "check_in": "2024-01-15T09:00:00",
    "check_out": "2024-01-15T17:00:00",
    "reason": "Employee forgot to check out, verified via chat"
}
```

**Validation Rules:**
- `check_in`: required, datetime
- `check_out`: nullable, datetime, must be after check_in
- `reason`: required, string, minimum 10 characters

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "user_id": 1,
        "check_in": "2024-01-15T09:00:00.000000Z",
        "check_out": "2024-01-15T17:00:00.000000Z",
        "date": "2024-01-15",
        "total_hours": 8.0,
        "tasks": [],
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "employee"
        }
    },
    "message": "Attendance updated successfully"
}
```

---

### Delete Attendance (Manager)

Delete attendance record with reason for audit.

**Endpoint:** `DELETE /api/v1/manager/attendances/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "reason": "Duplicate entry - employee checked in twice by mistake"
}
```

**Validation Rules:**
- `reason`: required, string, minimum 10 characters

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Attendance deleted successfully"
}
```

---

## User Management

All user management endpoints require **Manager** role.

### List All Users

**Endpoint:** `GET /api/v1/manager/users`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "employee",
            "created_at": "2024-01-15T10:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "Manager Admin",
            "email": "manager@example.com",
            "role": "manager",
            "created_at": "2024-01-15T10:00:00.000000Z"
        }
    ]
}
```

---

### Create User

**Endpoint:** `POST /api/v1/manager/users`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "name": "New Employee",
    "email": "newemployee@example.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!",
    "role": "employee"
}
```

**Validation Rules:**
- `name`: required, string, maximum 255 characters
- `email`: required, valid email, unique in database
- `password`: required, minimum 8 characters, confirmed
- `role`: required, enum (manager, employee)

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "id": 11,
        "name": "New Employee",
        "email": "newemployee@example.com",
        "role": "employee",
        "created_at": "2024-01-15T10:00:00.000000Z"
    },
    "message": "User created successfully"
}
```

---

### Update User

**Endpoint:** `PUT /api/v1/manager/users/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "employee"
}
```

**Validation Rules:**
- `name`: required, string, maximum 255 characters
- `email`: required, valid email, unique (except current user)
- `password`: optional, minimum 8 characters, confirmed
- `role`: required, enum (manager, employee)

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Updated Name",
        "email": "updated@example.com",
        "role": "employee",
        "created_at": "2024-01-15T10:00:00.000000Z"
    },
    "message": "User updated successfully"
}
```

---

### Delete User

**Endpoint:** `DELETE /api/v1/manager/users/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User deleted successfully"
}
```

---

## Holiday Management (Manager Only)

### Create Holiday

**Endpoint:** `POST /api/v1/manager/holidays`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "date": "2024-12-25",
    "name": "Christmas Day",
    "description": "Company holiday - Christmas celebration"
}
```

**Validation Rules:**
- `date`: required, date, unique
- `name`: required, string, maximum 255 characters
- `description`: nullable, string, maximum 500 characters

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "date": "2024-12-25",
        "name": "Christmas Day",
        "description": "Company holiday - Christmas celebration"
    },
    "message": "Holiday created successfully"
}
```

---

### Update Holiday

**Endpoint:** `PUT /api/v1/manager/holidays/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:** Same as Create Holiday

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "date": "2024-12-25",
        "name": "Updated Holiday Name",
        "description": "Updated description"
    },
    "message": "Holiday updated successfully"
}
```

---

### Delete Holiday

**Endpoint:** `DELETE /api/v1/manager/holidays/{id}`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Holiday deleted successfully"
}
```

---

## Leave Management (Manager Only)

### List All Leave Requests

**Endpoint:** `GET /api/v1/manager/leaves`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected)

**Example Request:**
```
GET /api/v1/manager/leaves?status=pending
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "user": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "employee"
            },
            "start_date": "2024-02-01",
            "end_date": "2024-02-03",
            "reason": "Family emergency",
            "status": "pending",
            "approved_by": null,
            "approver": null,
            "approved_at": null,
            "notes": null,
            "requested_at": "2024-01-15T10:00:00.000000Z"
        }
    ]
}
```

---

### Approve Leave

**Endpoint:** `PUT /api/v1/manager/leaves/{id}/approve`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "notes": "Approved. Take care and get well soon."
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 1,
        "start_date": "2024-02-01",
        "end_date": "2024-02-03",
        "reason": "Family emergency",
        "status": "approved",
        "approved_by": 5,
        "approver": {
            "id": 5,
            "name": "Manager Admin",
            "email": "manager@example.com",
            "role": "manager"
        },
        "approved_at": "2024-01-15T11:00:00.000000Z",
        "notes": "Approved. Take care and get well soon.",
        "requested_at": "2024-01-15T10:00:00.000000Z"
    },
    "message": "Leave request approved"
}
```

---

### Reject Leave

**Endpoint:** `PUT /api/v1/manager/leaves/{id}/reject`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Request Body:**
```json
{
    "notes": "We have a critical deadline during this period. Can you reschedule?"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "status": "rejected",
        "approved_by": 5,
        "approved_at": "2024-01-15T11:00:00.000000Z",
        "notes": "We have a critical deadline during this period. Can you reschedule?"
    },
    "message": "Leave request rejected"
}
```

---

## Activity Logs

### View Activity Logs (Manager Only)

**Endpoint:** `GET /api/v1/manager/activity-logs`

**Authentication Required:** Yes (Bearer Token + Manager Role)

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `action` (optional): Filter by action type (check_in, check_out, task_created, etc.)
- `start_date` (optional): Start date in format `Y-m-d`
- `end_date` (optional): End date in format `Y-m-d`

**Example Request:**
```
GET /api/v1/manager/activity-logs?user_id=1&action=check_in&start_date=2024-01-01
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": 1,
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "role": "employee"
                },
                "action": "check_in",
                "description": "User checked in",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0...",
                "created_at": "2024-01-15T09:00:00.000000Z"
            },
            {
                "id": 2,
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "role": "employee"
                },
                "action": "check_out",
                "description": "User checked out",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0...",
                "created_at": "2024-01-15T16:30:00.000000Z"
            },
            {
                "id": 3,
                "user": {
                    "id": 5,
                    "name": "Manager Admin",
                    "email": "manager@example.com",
                    "role": "manager"
                },
                "action": "attendance_edited",
                "description": "Edited attendance #123 for John Doe. Reason: Employee forgot to check out",
                "ip_address": "192.168.1.50",
                "user_agent": "Mozilla/5.0...",
                "created_at": "2024-01-15T18:00:00.000000Z"
            }
        ]
    }
}
```

**Available Action Types:**
- `check_in` - User checked in
- `check_out` - User checked out
- `task_created` - Task created
- `task_updated` - Task updated
- `attendance_edited` - Attendance edited by manager
- `attendance_deleted` - Attendance deleted by manager
- `user_created` - User created
- `user_updated` - User updated
- `user_deleted` - User deleted
- `leave_requested` - Leave requested
- `leave_approved` - Leave approved
- `leave_rejected` - Leave rejected
- `holiday_created` - Holiday created
- `holiday_updated` - Holiday updated
- `holiday_deleted` - Holiday deleted
- `auto_checkout` - System auto checkout
- `login` - User logged in
- `logout` - User logged out

---

## Error Responses

### 401 Unauthorized

When authentication token is missing or invalid.

```json
{
    "success": false,
    "message": "Unauthenticated."
}
```

### 403 Forbidden

When user doesn't have required role.

```json
{
    "success": false,
    "message": "Unauthorized. Manager role required."
}
```

### 422 Validation Error

When request validation fails.

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### 404 Not Found

When resource is not found.

```json
{
    "success": false,
    "message": "User not found"
}
```

### 500 Internal Server Error

When server error occurs.

```json
{
    "success": false,
    "message": "Failed to create user"
}
```

---

## Business Rules Summary

### Work Hours
- **Required daily hours**: 7 hours
- **Installment system**: Multiple check-ins per day allowed
- **Overtime tracking**: Hours > 7 recorded
- **Auto checkout**: Automatic at 23:59 daily

### Task Management
- **Minimum tasks per check-in**: 1 task
- **Maximum tasks per check-in**: 20 tasks
- **Tasks can be added**: During active session
- **Blocker reason required**: When task incomplete at checkout
- **Maximum blocker reason length**: 500 characters

### Leave Rules
- **Leave request**: Must be submitted before or on leave date
- **Manager approval**: Required for all leaves
- **Check-in during leave**: Blocked by system when approved
- **Leave dates**: Don't count toward required work hours

### Holiday Rules
- **Set by manager**: Only managers can add/edit holidays
- **Check-in blocked**: System prevents check-in on holidays
- **Doesn't count toward**: Required work hours

### Authorization
- **Employee can**: Check-in/out, view own reports, request leave, add tasks
- **Manager can**: All employee actions + view all data, edit/delete attendance, manage users, manage holidays, approve/reject leaves, view activity logs

---

## Rate Limiting

API rate limiting is handled by Laravel's default rate limiting middleware. Adjust in `app/Http/Kernel.php` if needed.

---

## Pagination

Currently, most endpoints return all records. For production, consider implementing pagination for large datasets.

---

## Date/Time Format

All date/time fields are returned in **ISO 8601 format** (e.g., `2024-01-15T09:00:00.000000Z`).

Dates should be sent in `Y-m-d` format (e.g., `2024-01-15`).

---

## Authentication Flow

1. User calls `/api/v1/auth/login` with email and password
2. Server validates credentials and returns user data with token
3. Client stores token (typically in localStorage)
4. Client includes token in `Authorization` header for subsequent requests: `Authorization: Bearer {token}`
5. Server validates token on each request
6. If token is invalid/expired, server returns 401 and client should redirect to login

---

## Testing

Use the following test credentials (from seeder):

**Manager:**
- Email: `manager@example.com`
- Password: `password123`

**Employee:**
- Email: `employee@example.com`
- Password: `password123`

---

## Support

For API support, contact the development team or refer to the project documentation.

