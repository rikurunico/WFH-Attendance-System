<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Super admin can view all teams.
     */
    public function test_super_admin_can_view_all_teams(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::SUPER_ADMIN,
            'team_id' => null,
            'leave_quota_days' => 0,
        ]);

        Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        Team::create([
            'name' => 'Team B',
            'slug' => 'team-b',
            'required_work_hours' => 8.0,
            'default_leave_quota_days' => 15,
            'max_leave_days_per_month' => 6,
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->getJson('/api/v1/super-admin/teams');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data',
            'pagination',
        ]);
        $response->assertJsonCount(2, 'data');
    }

    /**
     * Super admin can create team.
     */
    public function test_super_admin_can_create_team(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::SUPER_ADMIN,
            'team_id' => null,
            'leave_quota_days' => 0,
        ]);

        $teamData = [
            'name' => 'New Team',
            'description' => 'Test team description',
            'required_work_hours' => 7.5,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
        ];

        $response = $this->actingAs($superAdmin)->postJson('/api/v1/super-admin/teams', $teamData);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Team created successfully',
        ]);

        $this->assertDatabaseHas('teams', [
            'name' => 'New Team',
            'description' => 'Test team description',
        ]);
    }

    /**
     * Super admin can update team.
     */
    public function test_super_admin_can_update_team(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::SUPER_ADMIN,
            'team_id' => null,
            'leave_quota_days' => 0,
        ]);

        $team = Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        $updateData = [
            'name' => 'Team A Updated',
            'required_work_hours' => 8.0,
        ];

        $response = $this->actingAs($superAdmin)->putJson("/api/v1/super-admin/teams/{$team->id}", $updateData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Team updated successfully',
        ]);

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'name' => 'Team A Updated',
            'required_work_hours' => 8.0,
        ]);
    }

    /**
     * Super admin can delete empty team.
     */
    public function test_super_admin_can_delete_empty_team(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::SUPER_ADMIN,
            'team_id' => null,
            'leave_quota_days' => 0,
        ]);

        $team = Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->deleteJson("/api/v1/super-admin/teams/{$team->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Team deleted successfully',
        ]);

        $this->assertDatabaseMissing('teams', [
            'id' => $team->id,
        ]);
    }

    /**
     * Super admin cannot delete team with users.
     */
    public function test_super_admin_cannot_delete_team_with_users(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::SUPER_ADMIN,
            'team_id' => null,
            'leave_quota_days' => 0,
        ]);

        $team = Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::MANAGER,
            'team_id' => $team->id,
            'leave_quota_days' => 12,
        ]);

        $response = $this->actingAs($superAdmin)->deleteJson("/api/v1/super-admin/teams/{$team->id}");

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Cannot delete team with existing users. Please remove or reassign users first.',
        ]);

        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
        ]);
    }

    /**
     * Manager cannot access team management.
     */
    public function test_manager_cannot_access_team_management(): void
    {
        $team = Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::MANAGER,
            'team_id' => $team->id,
            'leave_quota_days' => 12,
        ]);

        $response = $this->actingAs($manager)->getJson('/api/v1/super-admin/teams');

        $response->assertStatus(403);
    }

    /**
     * Employee cannot access team management.
     */
    public function test_employee_cannot_access_team_management(): void
    {
        $team = Team::create([
            'name' => 'Team A',
            'slug' => 'team-a',
            'required_work_hours' => 7.0,
            'default_leave_quota_days' => 12,
            'max_leave_days_per_month' => 5,
            'is_active' => true,
        ]);

        $employee = User::create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::EMPLOYEE,
            'team_id' => $team->id,
            'leave_quota_days' => 12,
        ]);

        $response = $this->actingAs($employee)->getJson('/api/v1/super-admin/teams');

        $response->assertStatus(403);
    }
}
