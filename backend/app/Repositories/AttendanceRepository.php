<?php

namespace App\Repositories;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class AttendanceRepository
{
    /**
     * Find attendance by ID.
     */
    public function findById(int $id): ?Attendance
    {
        return Attendance::find($id);
    }

    /**
     * Find attendance by user and date.
     */
    public function findByUserAndDate(User $user, Carbon $date): ?Attendance
    {
        return Attendance::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->first();
    }

    /**
     * Find active attendance for user (has check_in but no check_out).
     * 
     * Note: Searches today and yesterday to handle edge cases where:
     * - User checked in late at night (e.g., 23:00)
     * - Auto-checkout is not running
     * - Server downtime occurred
     */
    public function findActiveByUser(User $user): ?Attendance
    {
        return Attendance::where('user_id', $user->id)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->where(function ($query) {
                $query->whereDate('date', Carbon::today())
                      ->orWhereDate('date', Carbon::yesterday());
            })
            ->with('tasks')
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->first();
    }

    /**
     * Find all active attendances for today (for auto-checkout).
     */
    public function findActiveForToday(): Collection
    {
        return Attendance::whereNotNull('check_in')
            ->whereNull('check_out')
            ->whereDate('date', Carbon::today())
            ->get();
    }

    /**
     * Get attendances by user in date range.
     */
    public function getByUserInDateRange(User $user, Carbon $startDate, Carbon $endDate): Collection
    {
        return Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('tasks')
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->get();
    }

    /**
     * Get all attendances by user for a specific date.
     */
    public function getAllByUserAndDate(User $user, Carbon $date): Collection
    {
        return Attendance::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->with('tasks')
            ->orderBy('check_in', 'asc')
            ->get();
    }

    /**
     * Create new attendance.
     */
    public function create(array $data): Attendance
    {
        return Attendance::create($data);
    }

    /**
     * Update attendance.
     */
    public function update(Attendance $attendance, array $data): bool
    {
        return $attendance->update($data);
    }

    /**
     * Delete attendance.
     */
    public function delete(Attendance $attendance): bool
    {
        return $attendance->delete();
    }

    /**
     * Get all attendances (for manager).
     */
    public function getAllInDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $query = Attendance::with(['user', 'tasks']);

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        return $query->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->get();
    }

    /**
     * Get paginated attendances (for manager).
     */
    public function getPaginatedInDateRange(?Carbon $startDate = null, ?Carbon $endDate = null, int $perPage = 10, ?int $userId = null)
    {
        $query = Attendance::with(['user', 'tasks']);

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->paginate($perPage);
    }
}

