<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\AttendanceRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    public function __construct(
        private AttendanceRepository $attendanceRepository
    ) {}

    /**
     * Get employee personal report.
     */
    public function getEmployeeReport(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $attendances = $this->attendanceRepository->getByUserInDateRange($user, $startDate, $endDate);

        // Group by date
        $groupedByDate = $attendances->groupBy(function ($attendance) {
            return $attendance->date->format('Y-m-d');
        });

        $dailyData = [];
        $totalDaysWorked = 0;
        $totalHours = 0;
        $incompleteDays = 0;
        $totalTasksCompleted = 0;
        $totalTasksIncomplete = 0;
        $totalTasks = 0;

        foreach ($groupedByDate as $date => $dayAttendances) {
            $dailyTotalHours = $dayAttendances->sum('total_hours');
            $totalHours += $dailyTotalHours;
            $totalDaysWorked++;

            // Sort attendances by check_in ascending so Session 1 is the earliest
            $sortedDayAttendances = $dayAttendances->sortBy(function ($attendance) {
                return $attendance->check_in;
            })->values();

            $sessions = $sortedDayAttendances->map(function ($attendance) {
                $tasksCompleted = $attendance->tasks->where('is_completed', true)->count();
                $tasksIncomplete = $attendance->tasks->where('is_completed', false)->count();

                return [
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'total_hours' => $attendance->total_hours,
                    'tasks_completed' => $tasksCompleted,
                    'tasks_incomplete' => $tasksIncomplete,
                    'tasks' => $attendance->tasks->map(function ($task) {
                        return [
                            'id' => $task->id,
                            'title' => $task->title,
                            'is_completed' => $task->is_completed,
                            'blocker_reason' => $task->blocker_reason,
                        ];
                    })->values(),
                ];
            })->values();

            // Count tasks (using sorted attendances for consistency)
            foreach ($sortedDayAttendances as $attendance) {
                $totalTasksCompleted += $attendance->tasks->where('is_completed', true)->count();
                $totalTasksIncomplete += $attendance->tasks->where('is_completed', false)->count();
                $totalTasks += $attendance->tasks->count();
            }

            $status = 'complete';
            if ($dailyTotalHours < 7.0) {
                $status = 'incomplete';
                $incompleteDays++;
            } elseif ($dailyTotalHours > 7.0) {
                $status = 'overtime';
            }

            $dailyData[] = [
                'date' => $date,
                'sessions' => $sessions,
                'daily_total_hours' => round($dailyTotalHours, 2),
                'status' => $status,
            ];
        }

        $averageHoursPerDay = $totalDaysWorked > 0 ? round($totalHours / $totalDaysWorked, 2) : 0;
        $requiredHours = $totalDaysWorked * 7;
        $overtimeHours = max(0, $totalHours - $requiredHours);
        $taskCompletionRate = $totalTasks > 0 ? round(($totalTasksCompleted / $totalTasks) * 100, 2) : 0;

        return [
            'summary' => [
                'total_days_worked' => $totalDaysWorked,
                'total_hours' => round($totalHours, 2),
                'average_hours_per_day' => $averageHoursPerDay,
                'required_hours' => $requiredHours,
                'overtime_hours' => round($overtimeHours, 2),
                'incomplete_days' => $incompleteDays,
                'task_completion_rate' => $taskCompletionRate,
            ],
            'attendances' => $dailyData,
        ];
    }

    /**
     * Get manager dashboard data.
     */
    public function getManagerDashboard(?Carbon $date = null): array
    {
        $targetDate = $date ?? Carbon::today();

        $allEmployees = User::where('role', 'employee')->get();

        $employees = [];
        $checkedInNow = 0;
        $onLeave = 0;
        $totalDailyHours = 0;
        $activeEmployeeCount = 0;

        foreach ($allEmployees as $employee) {
            $todayAttendances = $this->attendanceRepository->getAllByUserAndDate($employee, $targetDate);
            $activeAttendance = $this->attendanceRepository->findActiveByUser($employee);
            $todayTotalHours = $todayAttendances->sum('total_hours');

            if ($activeAttendance) {
                $elapsedHours = $activeAttendance->check_in->diffInHours(Carbon::now());
                $todayTotalHours += $elapsedHours;
                $checkedInNow++;
            }

            // Check if on leave
            $leave = $employee->leaves()
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $targetDate)
                ->whereDate('end_date', '>=', $targetDate)
                ->first();

            $status = 'checked_out';
            if ($activeAttendance) {
                $status = 'checked_in';
            } elseif ($leave) {
                $status = 'on_leave';
                $onLeave++;
            }

            if ($todayTotalHours > 0) {
                $totalDailyHours += $todayTotalHours;
                $activeEmployeeCount++;
            }

            // Calculate week and month totals
            $weekStart = $targetDate->copy()->startOfWeek();
            $weekEnd = $targetDate->copy()->endOfWeek();
            $monthStart = $targetDate->copy()->startOfMonth();
            $monthEnd = $targetDate->copy()->endOfMonth();

            $weekAttendances = $this->attendanceRepository->getByUserInDateRange($employee, $weekStart, $weekEnd);
            $monthAttendances = $this->attendanceRepository->getByUserInDateRange($employee, $monthStart, $monthEnd);

            $weekTotalHours = round($weekAttendances->sum('total_hours'), 2);
            $monthTotalHours = round($monthAttendances->sum('total_hours'), 2);

            $employeeData = [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'status' => $status,
                'current_session' => $activeAttendance ? [
                    'check_in' => $activeAttendance->check_in,
                    'elapsed_hours' => round($activeAttendance->check_in->diffInMinutes(Carbon::now()) / 60, 2),
                ] : null,
                'today_total_hours' => round($todayTotalHours, 2),
                'week_total_hours' => $weekTotalHours,
                'month_total_hours' => $monthTotalHours,
            ];

            if ($leave) {
                $employeeData['leave'] = [
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'reason' => $leave->reason,
                ];
            }

            $employees[] = $employeeData;
        }

        $averageDailyHours = $activeEmployeeCount > 0 ? round($totalDailyHours / $activeEmployeeCount, 2) : 0;

        return [
            'summary' => [
                'total_employees' => $allEmployees->count(),
                'checked_in_now' => $checkedInNow,
                'on_leave' => $onLeave,
                'average_daily_hours' => $averageDailyHours,
            ],
            'employees' => $employees,
        ];
    }

    /**
     * Get employee report for manager.
     */
    public function getEmployeeReportForManager(User $employee, Carbon $startDate, Carbon $endDate): array
    {
        return $this->getEmployeeReport($employee, $startDate, $endDate);
    }
}

