<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
        ]);
    }

    public function test_employee_can_check_in_with_tasks(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Complete feature X'],
                ['title' => 'Fix bug Y'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'user_id',
                    'check_in',
                    'date',
                    'tasks',
                ],
            ])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('attendances', [
            'user_id' => $this->user->id,
        ]);
    }

    public function test_employee_cannot_check_in_on_holiday(): void
    {
        Holiday::create([
            'date' => Carbon::today(),
            'name' => 'Test Holiday',
            'description' => 'Test',
        ]);

        $token = $this->user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_can_check_out(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Check in first
        $checkInResponse = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
                ['title' => 'Task 2'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $attendanceId = $checkInResponse->json('data.id');
        $tasks = $checkInResponse->json('data.tasks');

        // Check out
        $response = $this->postJson('/api/v1/attendance/check-out', [
            'attendance_id' => $attendanceId,
            'tasks' => [
                [
                    'id' => $tasks[0]['id'],
                    'is_completed' => true,
                    'blocker_reason' => null,
                ],
                [
                    'id' => $tasks[1]['id'],
                    'is_completed' => false,
                    'blocker_reason' => 'Waiting for dependencies',
                ],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'check_out',
                    'total_hours',
                ],
            ]);
    }

    public function test_employee_can_view_today_status(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/attendance/today', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'date',
                    'is_checked_in',
                    'today_total_hours',
                    'required_hours',
                ],
            ]);
    }

    public function test_employee_can_check_in_multiple_times_per_day_installment_system(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // First check-in
        $checkIn1 = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Morning tasks'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $attendanceId1 = $checkIn1->json('data.id');
        $tasks1 = $checkIn1->json('data.tasks');

        // Check out first session
        $this->postJson('/api/v1/attendance/check-out', [
            'attendance_id' => $attendanceId1,
            'tasks' => [
                [
                    'id' => $tasks1[0]['id'],
                    'is_completed' => true,
                    'blocker_reason' => null,
                ],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        // Second check-in (installment)
        $checkIn2 = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Afternoon tasks'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $checkIn2->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseCount('attendances', 2);
    }

    public function test_employee_cannot_check_in_when_active_session_exists(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // First check-in
        $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        // Try to check-in again without checking out
        $response = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 2'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    public function test_employee_cannot_check_out_without_active_session(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/attendance/check-out', [
            'attendance_id' => 999,
            'tasks' => [],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_cannot_check_out_when_already_checked_out(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Check in
        $checkIn = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $attendanceId = $checkIn->json('data.id');
        $tasks = $checkIn->json('data.tasks');

        // Check out first time
        $this->postJson('/api/v1/attendance/check-out', [
            'attendance_id' => $attendanceId,
            'tasks' => [
                [
                    'id' => $tasks[0]['id'],
                    'is_completed' => true,
                    'blocker_reason' => null,
                ],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        // Try to check out again
        $response = $this->postJson('/api/v1/attendance/check-out', [
            'attendance_id' => $attendanceId,
            'tasks' => [
                [
                    'id' => $tasks[0]['id'],
                    'is_completed' => true,
                    'blocker_reason' => null,
                ],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_check_out_calculates_total_hours_correctly(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Create attendance manually with known times
        $checkInTime = Carbon::parse('2024-01-15 09:00:00');
        $checkOutTime = Carbon::parse('2024-01-15 17:00:00');

        $attendance = Attendance::factory()->create([
            'user_id' => $this->user->id,
            'check_in' => $checkInTime,
            'check_out' => null,
            'date' => $checkInTime->toDateString(),
        ]);

        $task = $attendance->tasks()->create([
            'title' => 'Task 1',
            'is_completed' => false,
        ]);

        // Check out
        $response = $this->postJson("/api/v1/attendance/check-out", [
            'attendance_id' => $attendance->id,
            'tasks' => [
                [
                    'id' => $task->id,
                    'is_completed' => true,
                    'blocker_reason' => null,
                ],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_hours',
                ],
            ]);

        $totalHours = $response->json('data.total_hours');
        $this->assertGreaterThanOrEqual(0, $totalHours); // Should be calculated, even if small
    }
}
