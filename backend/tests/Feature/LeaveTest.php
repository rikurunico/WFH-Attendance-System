<?php

namespace Tests\Feature;

use App\Enums\LeaveStatus;
use App\Enums\UserRole;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LeaveTest extends TestCase
{
    use RefreshDatabase;

    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->employee = User::factory()->create([
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
        ]);
    }

    public function test_employee_can_request_leave(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/leaves', [
            'start_date' => Carbon::tomorrow()->format('Y-m-d'),
            'end_date' => Carbon::tomorrow()->addDays(2)->format('Y-m-d'),
            'reason' => 'Family emergency - need to travel to hometown',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'user_id',
                    'start_date',
                    'end_date',
                    'reason',
                    'status',
                ],
                'message',
            ])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('leaves', [
            'user_id' => $this->employee->id,
            'status' => LeaveStatus::PENDING->value,
        ]);
    }

    public function test_employee_cannot_request_leave_with_invalid_dates(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/leaves', [
            'start_date' => Carbon::yesterday()->format('Y-m-d'),
            'end_date' => Carbon::yesterday()->subDay()->format('Y-m-d'),
            'reason' => 'Short reason',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_cannot_request_leave_with_short_reason(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/leaves', [
            'start_date' => Carbon::tomorrow()->format('Y-m-d'),
            'end_date' => Carbon::tomorrow()->addDay()->format('Y-m-d'),
            'reason' => 'Short',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_can_view_my_leave_requests(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        // Create leave requests
        Leave::factory()->create([
            'user_id' => $this->employee->id,
            'status' => LeaveStatus::PENDING,
        ]);

        Leave::factory()->create([
            'user_id' => $this->employee->id,
            'status' => LeaveStatus::APPROVED,
        ]);

        $response = $this->getJson('/api/v1/leaves/my-requests', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'start_date',
                        'end_date',
                        'reason',
                        'status',
                    ],
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_employee_cannot_check_in_when_on_approved_leave(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        // Create approved leave for today
        Leave::factory()->create([
            'user_id' => $this->employee->id,
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today(),
            'status' => LeaveStatus::APPROVED,
        ]);

        $response = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_manager_cannot_access_employee_leave_endpoints(): void
    {
        $manager = User::factory()->create([
            'role' => UserRole::MANAGER,
        ]);
        $token = $manager->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/leaves', [
            'start_date' => Carbon::tomorrow()->format('Y-m-d'),
            'end_date' => Carbon::tomorrow()->addDay()->format('Y-m-d'),
            'reason' => 'Manager trying to request leave',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }
}
