<?php

namespace Tests\Feature;

use App\Enums\LeaveStatus;
use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ManagerDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private User $employee1;
    private User $employee2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manager = User::factory()->create([
            'email' => 'manager@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::MANAGER,
        ]);

        $this->employee1 = User::factory()->create([
            'email' => 'employee1@example.com',
            'role' => UserRole::EMPLOYEE,
        ]);

        $this->employee2 = User::factory()->create([
            'email' => 'employee2@example.com',
            'role' => UserRole::EMPLOYEE,
        ]);
    }

    public function test_manager_can_view_dashboard(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        // Create attendance for employee1
        Attendance::factory()->create([
            'user_id' => $this->employee1->id,
            'check_in' => Carbon::now()->subHours(2),
            'check_out' => null,
            'date' => Carbon::today(),
        ]);

        // Create completed attendance for employee2
        Attendance::factory()->create([
            'user_id' => $this->employee2->id,
            'check_in' => Carbon::today()->setTime(9, 0),
            'check_out' => Carbon::today()->setTime(17, 0),
            'date' => Carbon::today(),
            'total_hours' => 8.0,
        ]);

        $response = $this->getJson('/api/v1/manager/dashboard', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'total_employees',
                        'checked_in_now',
                        'on_leave',
                        'average_daily_hours',
                    ],
                    'employees',
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_view_dashboard_with_date_filter(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/dashboard?date=2024-01-15', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_manager_can_view_employee_report(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        // Create attendance for employee
        Attendance::factory()->create([
            'user_id' => $this->employee1->id,
            'check_in' => Carbon::parse('2024-01-15 09:00:00'),
            'check_out' => Carbon::parse('2024-01-15 17:00:00'),
            'date' => Carbon::parse('2024-01-15'),
            'total_hours' => 8.0,
        ]);

        $response = $this->getJson("/api/v1/manager/reports/employee/{$this->employee1->id}?start_date=2024-01-01&end_date=2024-01-31", [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'attendances',
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_manager_dashboard_shows_employees_on_leave(): void
    {
        $token = $this->manager->createToken('auth-token')->plainTextToken;

        // Create approved leave for today
        Leave::factory()->create([
            'user_id' => $this->employee1->id,
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today(),
            'status' => LeaveStatus::APPROVED,
        ]);

        $response = $this->getJson('/api/v1/manager/dashboard', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.summary.on_leave', 1);
    }

    public function test_employee_cannot_access_manager_dashboard(): void
    {
        $token = $this->employee1->createToken('auth-token')->plainTextToken;

        $response = $this->getJson('/api/v1/manager/dashboard', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(403);
    }
}
