<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\ChangePasswordController;
use App\Http\Controllers\Api\EmployeeReportController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ManagerAttendanceController;
use App\Http\Controllers\Api\ManagerLeaveController;
use App\Http\Controllers\Api\ManagerReportController;
use App\Http\Controllers\Api\ManagerTaskController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

// Authentication routes (no auth required)
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [LoginController::class, 'login']);
});

// Protected routes
Route::prefix('v1')->middleware(['auth:sanctum', 'log.user.activity'])->group(function () {
    // Authentication
    Route::post('/auth/logout', [LogoutController::class, 'logout']);
    
    // Change Password (available for all authenticated users)
    Route::post('/change-password', [ChangePasswordController::class, 'changePassword']);

    // Attendance routes (Employee)
    Route::prefix('attendance')->middleware('role:employee')->group(function () {
        Route::post('/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/check-out', [AttendanceController::class, 'checkOut']);
        Route::get('/today', [AttendanceController::class, 'today']);
    });

    // Task routes (Employee)
    Route::prefix('tasks')->middleware('role:employee')->group(function () {
        Route::post('/add', [TaskController::class, 'addTasks']);
        Route::get('/incomplete', [TaskController::class, 'incomplete']);
        Route::get('/incomplete-last-session', [TaskController::class, 'incompleteFromLastSession']);
    });

    // Employee Report routes
    Route::prefix('reports')->middleware('role:employee')->group(function () {
        Route::get('/my-report', [EmployeeReportController::class, 'myReport']);
    });

    // Leave routes (Employee)
    Route::prefix('leaves')->middleware('role:employee')->group(function () {
        Route::post('/', [LeaveController::class, 'store']);
        Route::get('/my-requests', [LeaveController::class, 'myRequests']);
        Route::get('/summary', [LeaveController::class, 'summary']);
    });

    // Holidays (Both roles can view)
    Route::get('/holidays', [HolidayController::class, 'index']);

    // Manager routes
    Route::middleware('role:manager')->group(function () {
        // Manager Dashboard
        Route::get('/manager/dashboard', [ManagerReportController::class, 'dashboard']);
        Route::get('/manager/reports/employee/{userId}', [ManagerReportController::class, 'employeeReport']);
        Route::get('/manager/reports/daily-attendance', [ManagerReportController::class, 'dailyAttendanceReport']);
        Route::get('/manager/reports/monthly-attendance', [ManagerReportController::class, 'monthlyAttendanceReport']);

        // User Management
        Route::prefix('manager/users')->group(function () {
            Route::get('/', [UserManagementController::class, 'index']);
            Route::post('/', [UserManagementController::class, 'store']);
            Route::put('/{id}', [UserManagementController::class, 'update']);
            Route::delete('/{id}', [UserManagementController::class, 'destroy']);
        });

        // Attendance Management
        Route::prefix('manager/attendances')->group(function () {
            Route::get('/', [ManagerAttendanceController::class, 'index']);
            Route::put('/{id}', [ManagerAttendanceController::class, 'update']);
            Route::delete('/{id}', [ManagerAttendanceController::class, 'destroy']);
        });

        // Task Management (Manager)
        Route::prefix('manager/tasks')->group(function () {
            Route::put('/{id}', [ManagerTaskController::class, 'update']);
        });

        // Holiday Management
        Route::prefix('manager/holidays')->group(function () {
            Route::post('/', [HolidayController::class, 'store']);
            Route::put('/{id}', [HolidayController::class, 'update']);
            Route::delete('/{id}', [HolidayController::class, 'destroy']);
        });

        // Leave Management
        Route::prefix('manager/leaves')->group(function () {
            Route::get('/', [ManagerLeaveController::class, 'index']);
            Route::put('/{id}/approve', [ManagerLeaveController::class, 'approve']);
            Route::put('/{id}/reject', [ManagerLeaveController::class, 'reject']);
        });

        // Activity Logs
        Route::get('/manager/activity-logs', [ActivityLogController::class, 'index']);
    });
});

