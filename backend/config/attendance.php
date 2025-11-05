<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Required Daily Work Hours
    |--------------------------------------------------------------------------
    |
    | This value determines the minimum number of hours an employee must work
    | per day to be considered as having completed their work requirement.
    |
    | You can change this value in your .env file by setting:
    | REQUIRED_WORK_HOURS=7
    |
    */

    'required_work_hours' => env('REQUIRED_WORK_HOURS', 7),

    /*
    |--------------------------------------------------------------------------
    | Maximum Leave Days Per Month
    |--------------------------------------------------------------------------
    |
    | This value determines the maximum number of leave days an employee can
    | request within a single month. This helps prevent excessive leave
    | requests in a short period.
    |
    | You can change this value in your .env file by setting:
    | MAX_LEAVE_DAYS_PER_MONTH=5
    |
    */

    'max_leave_days_per_month' => env('MAX_LEAVE_DAYS_PER_MONTH', 3),

    /*
    |--------------------------------------------------------------------------
    | Default Leave Quota Days
    |--------------------------------------------------------------------------
    |
    | This value determines the default annual leave quota for new employees.
    | Each employee can have their own quota which can be adjusted individually.
    |
    | You can change this value in your .env file by setting:
    | DEFAULT_LEAVE_QUOTA_DAYS=12
    |
    */

    'default_leave_quota_days' => env('DEFAULT_LEAVE_QUOTA_DAYS', 12),

];
