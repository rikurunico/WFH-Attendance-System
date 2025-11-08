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
use Tests\Traits\CreatesTeamUsers;

class ManagerLeaveTest extends TestCase
{
    use RefreshDatabase, CreatesTeamUsers;

    private User $manager;
    private User $employee;
    private Leave $leaveRequest;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manager = $this->createManager([
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->employee = $this->createEmployee([
            'email' => 'employee@example.com',
        ]);

        $this->leaveRequest = $this->createLeave([
            'user_id' => $this->employee->id,
            'start_date' => Carbon::tomorrow(),
            'end_date' => Carbon::tomorrow()->addDays(2),
            'status' => LeaveStatus::PENDING,
        ]);
    }

    public function test_manager_can_list_all_leave_requests(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        // Create additional leave requests
        $this->createLeave([
            'user_id' => $this->employee->id,
            'status' => LeaveStatus::APPROVED,
        ]);

        $this->createLeave([
            'user_id' => $this->employee->id,
            'status' => LeaveStatus::REJECTED,
        ]);

        $response = $this->getJson('/api/v1/manager/leaves', [
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

    public function test_manager_can_filter_leave_requests_by_status(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/leaves?status=pending', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_approve_leave_request(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/leaves/{$this->leaveRequest->id}/approve", [
            'notes' => 'Approved. Take care and get well soon.',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'status',
                    'approved_by',
                    'approved_at',
                    'notes',
                ],
                'message',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => LeaveStatus::APPROVED->value,
                ],
            ]);

        $this->assertDatabaseHas('leaves', [
            'id' => $this->leaveRequest->id,
            'status' => LeaveStatus::APPROVED->value,
            'approved_by' => $this->manager->id,
        ]);
    }

    public function test_manager_can_reject_leave_request(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/leaves/{$this->leaveRequest->id}/reject", [
            'notes' => 'We have a critical deadline during this period. Can you reschedule?',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => LeaveStatus::REJECTED->value,
                ],
            ]);

        $this->assertDatabaseHas('leaves', [
            'id' => $this->leaveRequest->id,
            'status' => LeaveStatus::REJECTED->value,
            'approved_by' => $this->manager->id,
        ]);
    }

    public function test_employee_cannot_access_manager_leave_endpoints(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/leaves', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }

    public function test_employee_cannot_approve_leave(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/leaves/{$this->leaveRequest->id}/approve", [
            'notes' => 'Employee trying to approve',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }
}
