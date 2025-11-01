<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TaskTest extends TestCase
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

    public function test_employee_can_add_tasks_to_active_session(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Check in first
        $checkInResponse = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Initial Task'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $attendanceId = $checkInResponse->json('data.id');

        // Add more tasks
        $response = $this->postJson('/api/v1/tasks/add', [
            'attendance_id' => $attendanceId,
            'tasks' => [
                ['title' => 'Additional Task 1'],
                ['title' => 'Additional Task 2'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'tasks',
                ],
            ]);
    }

    public function test_employee_can_view_incomplete_tasks(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Create attendance with incomplete task
        $attendance = Attendance::factory()->create([
            'user_id' => $this->user->id,
            'check_in' => Carbon::now(),
            'check_out' => null,
            'date' => Carbon::today(),
        ]);

        $attendance->tasks()->create([
            'title' => 'Incomplete Task',
            'is_completed' => false,
        ]);

        $response = $this->getJson('/api/v1/tasks/incomplete', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_employee_cannot_add_tasks_to_completed_attendance(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        // Create completed attendance
        $attendance = Attendance::factory()->create([
            'user_id' => $this->user->id,
            'check_in' => Carbon::now()->subHours(9),
            'check_out' => Carbon::now()->subHour(),
            'date' => Carbon::today(),
            'total_hours' => 8.0,
        ]);

        $response = $this->postJson('/api/v1/tasks/add', [
            'attendance_id' => $attendance->id,
            'tasks' => [
                ['title' => 'New Task'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_cannot_add_tasks_to_other_user_attendance(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $otherUser = User::factory()->create(['role' => \App\Enums\UserRole::EMPLOYEE]);

        // Create attendance for other user
        $attendance = Attendance::factory()->create([
            'user_id' => $otherUser->id,
            'check_in' => Carbon::now(),
            'check_out' => null,
            'date' => Carbon::today(),
        ]);

        $response = $this->postJson('/api/v1/tasks/add', [
            'attendance_id' => $attendance->id,
            'tasks' => [
                ['title' => 'New Task'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_add_tasks_validation_requires_attendance_id(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/v1/tasks/add', [
            'tasks' => [
                ['title' => 'Task 1'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attendance_id']);
    }

    public function test_add_tasks_validation_requires_tasks(): void
    {
        $token = $this->user->createToken('auth-token')->plainTextToken;

        $checkIn = $this->postJson('/api/v1/attendance/check-in', [
            'tasks' => [
                ['title' => 'Initial Task'],
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $attendanceId = $checkIn->json('data.id');

        $response = $this->postJson('/api/v1/tasks/add', [
            'attendance_id' => $attendanceId,
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tasks']);
    }
}
