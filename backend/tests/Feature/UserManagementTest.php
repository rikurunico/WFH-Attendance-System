<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create([
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::MANAGER,
        ]);

        $this->employee = User::factory()->create([
            'email' => 'employee@example.com',
            'role' => UserRole::EMPLOYEE,
        ]);
    }

    public function test_manager_can_list_all_users(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/users', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'role',
                    ],
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_create_user(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/manager/users', [
            'name' => 'New Employee',
            'email' => 'newemployee@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
                'message',
            ])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'email' => 'newemployee@example.com',
            'role' => UserRole::EMPLOYEE->value,
        ]);
    }

    public function test_manager_can_create_manager_user(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/manager/users', [
            'name' => 'New Manager',
            'email' => 'newmanager@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'manager',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'email' => 'newmanager@example.com',
            'role' => UserRole::MANAGER->value,
        ]);
    }

    public function test_manager_can_update_user(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/users/{$this->employee->id}", [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $this->employee->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_manager_can_update_user_password(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/users/{$this->employee->id}", [
            'name' => $this->employee->name,
            'email' => $this->employee->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_delete_user(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $userToDelete = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
        ]);

        $response = $this->deleteJson("/api/v1/manager/users/{$userToDelete->id}", [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('users', [
            'id' => $userToDelete->id,
        ]);
    }

    public function test_manager_cannot_create_user_with_duplicate_email(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/manager/users', [
            'name' => 'New Employee',
            'email' => $this->employee->email,
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_manager_cannot_create_user_with_invalid_password(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/manager/users', [
            'name' => 'New Employee',
            'email' => 'new@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_cannot_access_user_management(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/users', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }
}
