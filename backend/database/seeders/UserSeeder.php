<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Team;
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
        $team = Team::firstOrCreate(
            ['slug' => 'default-team'],
            [
                'name' => 'Default Team',
                'description' => 'Default team for seeded users',
                'required_work_hours' => Team::DEFAULT_REQUIRED_WORK_HOURS,
                'default_leave_quota_days' => Team::DEFAULT_LEAVE_QUOTA_DAYS,
                'max_leave_days_per_month' => Team::DEFAULT_MAX_LEAVE_DAYS_PER_MONTH,
                'is_active' => true,
            ]
        );

        // Create default manager
        User::create([
            'team_id' => $team->id,
            'name' => 'Manager Admin',
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::MANAGER,
            'leave_quota_days' => $team->default_leave_quota_days,
        ]);

        // Create sample employees
        User::create([
            'team_id' => $team->id,
            'name' => 'John Doe',
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
            'leave_quota_days' => $team->default_leave_quota_days,
        ]);

        User::create([
            'team_id' => $team->id,
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
            'leave_quota_days' => 15, // Example: Different quota for different employee
        ]);
    }
}
