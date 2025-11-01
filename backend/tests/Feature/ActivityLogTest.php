<?php

namespace Tests\Feature;

use App\Enums\ActivityType;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ActivityLogTest extends TestCase
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

    public function test_manager_can_view_activity_logs(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        // Create some activity logs
        ActivityLog::factory()->create([
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_IN,
            'description' => 'User checked in',
        ]);

        ActivityLog::factory()->create([
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_OUT,
            'description' => 'User checked out',
        ]);

        $response = $this->getJson('/api/v1/manager/activity-logs', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'logs' => [
                        '*' => [
                            'id',
                            'user' => ['id', 'name', 'email'],
                            'action',
                            'description',
                            'ip_address',
                            'user_agent',
                            'created_at',
                        ],
                    ],
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_filter_activity_logs_by_user(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        ActivityLog::factory()->create([
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_IN,
        ]);

        $response = $this->getJson("/api/v1/manager/activity-logs?user_id={$this->employee->id}", [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_filter_activity_logs_by_action(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        ActivityLog::factory()->create([
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_IN,
        ]);

        $response = $this->getJson('/api/v1/manager/activity-logs?action=check_in', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_filter_activity_logs_by_date_range(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        ActivityLog::factory()->create([
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_IN,
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/manager/activity-logs?start_date=2024-01-01&end_date=2024-01-31', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_employee_cannot_access_activity_logs(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/activity-logs', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }

    public function test_activity_logs_are_created_on_check_in(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->employee->id,
            'action' => ActivityType::CHECK_IN->value,
        ]);
    }

    public function test_activity_logs_are_created_on_user_creation(): void
    {
        $managerToken = $this->manager->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/v1/manager/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'employee',
        ], [
            'Authorization' => "Bearer {$managerToken}",
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => ActivityType::USER_CREATED->value,
        ]);
    }
}
