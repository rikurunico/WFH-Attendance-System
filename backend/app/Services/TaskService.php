<?php

namespace App\Services;

use App\Enums\ActivityType;
use App\Models\Attendance;
use App\Models\User;
use App\Repositories\AttendanceRepository;
use App\Repositories\TaskRepository;
use Illuminate\Http\Request;

class TaskService
{
    public function __construct(
        private TaskRepository $taskRepository,
        private AttendanceRepository $attendanceRepository,
        private ActivityLogService $activityLogService
    ) {}

    /**
     * Add tasks to existing attendance session.
     */
    public function addTasks(User $user, int $attendanceId, array $tasks, ?Request $request = null): \Illuminate\Database\Eloquent\Collection
    {
        $attendance = $this->attendanceRepository->findById($attendanceId);

        if (!$attendance || $attendance->user_id !== $user->id) {
            throw new \Exception('Attendance record not found or does not belong to you.');
        }

        if ($attendance->check_out) {
            throw new \Exception('Cannot add tasks to completed attendance session.');
        }

        $createdTasks = $this->taskRepository->createMany($attendance, $tasks);

        $this->activityLogService->logActivity(
            $user,
            ActivityType::TASK_CREATED,
            "User added " . count($tasks) . " tasks to attendance session",
            $request
        );

        return $createdTasks;
    }

    /**
     * Get incomplete tasks for user.
     */
    public function getIncompleteTasks(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $this->taskRepository->getIncompleteTasksForUser($user->id);
    }
}

