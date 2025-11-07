<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UserRepository
{
    /**
     * Get all users.
     */
    public function getAll(): Collection
    {
        return User::orderBy('name')->get();
    }

    /**
     * Get paginated users.
     */
    public function getPaginated(int $perPage = 10)
    {
        return User::orderBy('name')->paginate($perPage);
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
     * Get all employees.
     */
    public function getEmployees(): Collection
    {
        return User::where('role', 'employee')->orderBy('name')->get();
    }

    /**
     * Get all managers.
     */
    public function getManagers(): Collection
    {
        return User::where('role', 'manager')->orderBy('name')->get();
    }
}

