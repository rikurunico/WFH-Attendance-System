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
        // Create default manager
        User::create([
            'name' => 'Manager Admin',
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::MANAGER,
        ]);

        // Create sample employees
        User::create([
            'name' => 'John Doe',
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
        ]);
    }
}
