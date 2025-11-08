<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UserRepository
{
    /**
     * Get all users for a team.
     */
    public function getAll(?int $teamId = null): Collection
    {
        $query = User::query();
        
        if ($teamId) {
            $query->where('team_id', $teamId);
        }
        
        return $query->orderBy('name')->get();
    }

    /**
     * Get paginated users for a team.
     */
    public function getPaginated(int $perPage = 10, ?int $teamId = null)
    {
        $query = User::withCount([
            'leaves as approved_leaves_count' => function ($query) {
                $query->where('status', 'approved');
            }
        ]);
        
        if ($teamId) {
            $query->where('team_id', $teamId);
        }
        
        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Create user.
     */
    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        
        // Set default leave quota if not provided
        if (!isset($data['leave_quota_days'])) {
            $data['leave_quota_days'] = config('attendance.default_leave_quota_days', 12);
        }
        
        return User::create($data);
    }

    /**
     * Update user.
     */
    public function update(User $user, array $data): bool
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        return $user->update($data);
    }

    /**
     * Delete user.
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Get all employees for a team.
     */
    public function getEmployees(?int $teamId = null): Collection
    {
        $query = User::where('role', 'employee');
        
        if ($teamId) {
            $query->where('team_id', $teamId);
        }
        
        return $query->orderBy('name')->get();
    }

    /**
     * Get all managers for a team.
     */
    public function getManagers(?int $teamId = null): Collection
    {
        $query = User::where('role', 'manager');
        
        if ($teamId) {
            $query->where('team_id', $teamId);
        }
        
        return $query->orderBy('name')->get();
    }

    /**
     * Search users by name within a team.
     */
    public function searchByName(string $search, int $limit = 10, ?int $teamId = null): Collection
    {
        $query = User::where('name', 'LIKE', "%{$search}%");
        
        if ($teamId) {
            $query->where('team_id', $teamId);
        }
        
        return $query->orderBy('name')
            ->limit($limit)
            ->get();
    }
}

