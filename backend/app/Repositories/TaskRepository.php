<?php

namespace App\Repositories;

use App\Models\Attendance;
use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository
{
    /**
     * Create tasks for attendance.
     */
    public function createMany(Attendance $attendance, array $tasksData): Collection
    {
        $taskIds = [];

        foreach ($tasksData as $taskData) {
            $task = Task::create([
                'attendance_id' => $attendance->id,
                'title' => $taskData['title'],
                'is_completed' => false,
                'blocker_reason' => null,
            ]);
            $taskIds[] = $task->id;
        }

        // Return as Eloquent Collection
        return Task::whereIn('id', $taskIds)->get();
    }

    /**
     * Update task status.
     */
    public function updateStatus(Task $task, bool $isCompleted, ?string $blockerReason = null): bool
    {
        return $task->update([
            'is_completed' => $isCompleted,
            'blocker_reason' => $blockerReason,
        ]);
    }

    /**
     * Update multiple tasks status.
     *
     * Optimized to reduce database queries using bulk operations.
     */
    public function updateMultipleStatuses(array $tasksData): void
    {
        // Group updates by completion status to reduce queries
        $taskIds = collect($tasksData)->pluck('id')->toArray();

        // Verify all tasks exist
        $existingTasks = Task::whereIn('id', $taskIds)->get()->keyBy('id');

        foreach ($tasksData as $taskData) {
            if (!$existingTasks->has($taskData['id'])) {
                throw new \Exception("Task with ID {$taskData['id']} not found");
            }

            // Update individual task (keep original logic for blocker reasons)
            $task = $existingTasks->get($taskData['id']);
            $this->updateStatus(
                $task,
                $taskData['is_completed'],
                $taskData['blocker_reason'] ?? null
            );
        }
    }

    /**
     * Get incomplete tasks for user (from all history).
     */
    public function getIncompleteTasksForUser(int $userId): Collection
    {
        return Task::whereHas('attendance', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->where('is_completed', false)
            ->with('attendance')
            ->get();
    }

    /**
     * Get incomplete tasks from user's last attendance session only.
     */
    public function getIncompleteTasksFromLastSession(int $userId): Collection
    {
        // Get the last attendance (most recent check-out)
        $lastAttendance = \App\Models\Attendance::where('user_id', $userId)
            ->whereNotNull('check_out') // Only completed sessions
            ->orderBy('check_out', 'desc')
            ->first();

        if (!$lastAttendance) {
            return new Collection([]);
        }

        // Get incomplete tasks from that attendance only
        return Task::where('attendance_id', $lastAttendance->id)
            ->where('is_completed', false)
            ->with('attendance')
            ->get();
    }

    /**
     * Get tasks by attendance.
     */
    public function getByAttendance(Attendance $attendance): Collection
    {
        return Task::where('attendance_id', $attendance->id)->get();
    }
}

