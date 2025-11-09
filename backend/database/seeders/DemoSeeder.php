<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Team A
        $teamA = Team::updateOrCreate(
            ['slug' => 'team-development'],
            [
                'name' => 'Team Development',
                'description' => 'Development team',
                'required_work_hours' => 7.0,
                'default_leave_quota_days' => 12,
                'max_leave_days_per_month' => 5,
                'is_active' => true,
            ]
        );

        // Create Team B
        $teamB = Team::updateOrCreate(
            ['slug' => 'team-marketing'],
            [
                'name' => 'Team Marketing',
                'description' => 'Marketing team',
                'required_work_hours' => 7.5,
                'default_leave_quota_days' => 15,
                'max_leave_days_per_month' => 6,
                'is_active' => true,
            ]
        );

        // Create Team C
        $teamC = Team::updateOrCreate(
            ['slug' => 'team-sales'],
            [
                'name' => 'Team Sales',
                'description' => 'Sales team',
                'required_work_hours' => 8.0,
                'default_leave_quota_days' => 10,
                'max_leave_days_per_month' => 4,
                'is_active' => true,
            ]
        );

        // Create managers for each team
        User::updateOrCreate(
            ['email' => 'manager.dev@example.com'],
            [
                'team_id' => $teamA->id,
                'name' => 'Manager Development',
                'password' => Hash::make('password123'),
                'role' => UserRole::MANAGER,
                'leave_quota_days' => $teamA->default_leave_quota_days,
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager.marketing@example.com'],
            [
                'team_id' => $teamB->id,
                'name' => 'Manager Marketing',
                'password' => Hash::make('password123'),
                'role' => UserRole::MANAGER,
                'leave_quota_days' => $teamB->default_leave_quota_days,
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager.sales@example.com'],
            [
                'team_id' => $teamC->id,
                'name' => 'Manager Sales',
                'password' => Hash::make('password123'),
                'role' => UserRole::MANAGER,
                'leave_quota_days' => $teamC->default_leave_quota_days,
            ]
        );

        // Create employees for Team A
        User::updateOrCreate(
            ['email' => 'john.dev@example.com'],
            [
                'team_id' => $teamA->id,
                'name' => 'John Developer',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamA->default_leave_quota_days,
            ]
        );

        User::updateOrCreate(
            ['email' => 'jane.dev@example.com'],
            [
                'team_id' => $teamA->id,
                'name' => 'Jane Developer',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamA->default_leave_quota_days,
            ]
        );

        // Create employees for Team B
        User::updateOrCreate(
            ['email' => 'alice.marketing@example.com'],
            [
                'team_id' => $teamB->id,
                'name' => 'Alice Marketing',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamB->default_leave_quota_days,
            ]
        );

        User::updateOrCreate(
            ['email' => 'bob.marketing@example.com'],
            [
                'team_id' => $teamB->id,
                'name' => 'Bob Marketing',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamB->default_leave_quota_days,
            ]
        );

        // Create employees for Team C
        User::updateOrCreate(
            ['email' => 'charlie.sales@example.com'],
            [
                'team_id' => $teamC->id,
                'name' => 'Charlie Sales',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamC->default_leave_quota_days,
            ]
        );

        User::updateOrCreate(
            ['email' => 'diana.sales@example.com'],
            [
                'team_id' => $teamC->id,
                'name' => 'Diana Sales',
                'password' => Hash::make('password123'),
                'role' => UserRole::EMPLOYEE,
                'leave_quota_days' => $teamC->default_leave_quota_days,
            ]
        );
    }
}
