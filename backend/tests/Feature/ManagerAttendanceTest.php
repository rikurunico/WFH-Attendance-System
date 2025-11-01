<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ManagerAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private User $employee;
    private Attendance $attendance;

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

        $this->attendance = Attendance::factory()->create([
            'user_id' => $this->employee->id,
            'check_in' => Carbon::parse('2024-01-15 09:00:00'),
            'check_out' => Carbon::parse('2024-01-15 17:00:00'),
            'date' => Carbon::parse('2024-01-15'),
            'total_hours' => 8.0,
        ]);
    }

    public function test_manager_can_list_all_attendances(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/attendances', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'check_in',
                        'check_out',
                        'date',
                        'total_hours',
                    ],
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_list_attendances_with_date_range(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/attendances?start_date=2024-01-01&end_date=2024-01-31', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_edit_attendance(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'check_in' => '2024-01-15T09:00:00',
            'check_out' => '2024-01-15T18:00:00',
            'reason' => 'Employee forgot to check out, verified via chat',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'check_in',
                    'check_out',
                    'total_hours',
                ],
                'message',
            ])
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('attendances', [
            'id' => $this->attendance->id,
        ]);
    }

    public function test_manager_cannot_edit_attendance_without_reason(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'check_in' => '2024-01-15T09:00:00',
            'check_out' => '2024-01-15T18:00:00',
            'reason' => 'Short',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_manager_can_delete_attendance(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->deleteJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'reason' => 'Duplicate entry - employee checked in twice by mistake',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('attendances', [
            'id' => $this->attendance->id,
        ]);
    }

    public function test_manager_cannot_delete_attendance_without_reason(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->deleteJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'reason' => 'Short',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422);
    }

    public function test_employee_cannot_edit_attendance(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->putJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'check_in' => '2024-01-15T09:00:00',
            'check_out' => '2024-01-15T18:00:00',
            'reason' => 'Employee trying to edit',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }

    public function test_employee_cannot_delete_attendance(): void
    {
        $token = $this->employee->createToken('auth-token')->plainTextToken;

        $response = $this->deleteJson("/api/v1/manager/attendances/{$this->attendance->id}", [
            'reason' => 'Employee trying to delete',
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }
}
