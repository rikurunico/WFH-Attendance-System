<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultLeaveQuota = config('attendance.default_leave_quota_days', 12);

        // Create default manager
        User::create([
            'name' => 'Manager Admin',
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::MANAGER,
            'leave_quota_days' => $defaultLeaveQuota,
        ]);

        // Create sample employees
        User::create([
            'name' => 'John Doe',
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
            'leave_quota_days' => $defaultLeaveQuota,
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
            'leave_quota_days' => 15, // Example: Different quota for different employee
        ]);
    }
}
