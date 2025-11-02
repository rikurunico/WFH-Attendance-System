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

];
