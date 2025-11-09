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
        // Create or update super admin account
        User::updateOrCreate(
            ['email' => 'admin@example.com'], // Find by email
            [
                'team_id' => null, // Super admin doesn't belong to any specific team
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'role' => UserRole::SUPER_ADMIN,
                'leave_quota_days' => 0, // Super admin doesn't need leave quota
            ]
        );
    }
}
