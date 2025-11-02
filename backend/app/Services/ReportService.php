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

            $requiredWorkHours = config('attendance.required_work_hours', 7);
            
            $status = 'complete';
            if ($dailyTotalHours < $requiredWorkHours) {
                $status = 'incomplete';
                $incompleteDays++;
            } elseif ($dailyTotalHours > $requiredWorkHours) {
                $status = 'overtime';
            }

            $dailyData[] = [
                'date' => $date,
                'sessions' => $sessions,
                'daily_total_hours' => round($dailyTotalHours, 2),
                'status' => $status,
            ];
        }

        $requiredWorkHours = config('attendance.required_work_hours', 7);
        $averageHoursPerDay = $totalDaysWorked > 0 ? round($totalHours / $totalDaysWorked, 2) : 0;
        $requiredHours = $totalDaysWorked * $requiredWorkHours;
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

    /**
     * Get daily attendance report for all employees on a specific date.
     * Shows employee list with total hours, overtime, sessions, and tasks.
     */
    public function getDailyAttendanceReport(Carbon $date): array
    {
        $requiredWorkHours = config('attendance.required_work_hours', 7);
        
        $allEmployees = User::where('role', 'employee')->get();
        $employeeReports = [];

        foreach ($allEmployees as $employee) {
            $dayAttendances = $this->attendanceRepository->getAllByUserAndDate($employee, $date);
            
            // Skip if no attendance for this date
            if ($dayAttendances->isEmpty()) {
                // Check if on leave
                $leave = $employee->leaves()
                    ->where('status', 'approved')
                    ->whereDate('start_date', '<=', $date)
                    ->whereDate('end_date', '>=', $date)
                    ->first();
                
                if ($leave) {
                    $employeeReports[] = [
                        'employee' => [
                            'id' => $employee->id,
                            'name' => $employee->name,
                            'email' => $employee->email,
                        ],
                        'status' => 'on_leave',
                        'daily_total_hours' => 0,
                        'overtime_hours' => 0,
                        'sessions' => [],
                    ];
                }
                continue;
            }

            $dailyTotalHours = $dayAttendances->sum('total_hours');
            $overtimeHours = max(0, $dailyTotalHours - $requiredWorkHours);

            // Sort attendances by check_in ascending so Session 1 is the earliest
            $sortedDayAttendances = $dayAttendances->sortBy(function ($attendance) {
                return $attendance->check_in;
            })->values();

            $sessions = $sortedDayAttendances->map(function ($attendance, $index) {
                $tasksCompleted = $attendance->tasks->where('is_completed', true)->count();
                $tasksIncomplete = $attendance->tasks->where('is_completed', false)->count();

                return [
                    'session_number' => $index + 1,
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

            $status = 'complete';
            if ($dailyTotalHours < $requiredWorkHours) {
                $status = 'incomplete';
            } elseif ($dailyTotalHours > $requiredWorkHours) {
                $status = 'overtime';
            }

            $employeeReports[] = [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                ],
                'status' => $status,
                'daily_total_hours' => round($dailyTotalHours, 2),
                'overtime_hours' => round($overtimeHours, 2),
                'required_hours' => $requiredWorkHours,
                'sessions' => $sessions,
            ];
        }

        // Sort by employee name
        usort($employeeReports, function ($a, $b) {
            return strcmp($a['employee']['name'], $b['employee']['name']);
        });

        return [
            'date' => $date->format('Y-m-d'),
            'required_hours' => $requiredWorkHours,
            'employees' => $employeeReports,
        ];
    }

    /**
     * Get monthly attendance report for all employees within a date range.
     * Shows employee list with total work hours. Clicking employee shows daily details.
     */
    public function getMonthlyAttendanceReport(Carbon $startDate, Carbon $endDate): array
    {
        $requiredWorkHours = config('attendance.required_work_hours', 7);
        
        $allEmployees = User::where('role', 'employee')->get();
        $employeeReports = [];

        foreach ($allEmployees as $employee) {
            $attendances = $this->attendanceRepository->getByUserInDateRange($employee, $startDate, $endDate);
            
            // Group by date for daily details
            $groupedByDate = $attendances->groupBy(function ($attendance) {
                return $attendance->date->format('Y-m-d');
            });

            $dailyDetails = [];
            $totalHours = 0;
            $totalOvertimeHours = 0;
            $totalDaysWorked = 0;

            foreach ($groupedByDate as $date => $dayAttendances) {
                $dailyTotalHours = $dayAttendances->sum('total_hours');
                $dailyOvertimeHours = max(0, $dailyTotalHours - $requiredWorkHours);
                
                $totalHours += $dailyTotalHours;
                $totalOvertimeHours += $dailyOvertimeHours;
                $totalDaysWorked++;

                // Sort attendances by check_in ascending
                $sortedDayAttendances = $dayAttendances->sortBy(function ($attendance) {
                    return $attendance->check_in;
                })->values();

                $sessions = $sortedDayAttendances->map(function ($attendance, $index) {
                    $tasksCompleted = $attendance->tasks->where('is_completed', true)->count();
                    $tasksIncomplete = $attendance->tasks->where('is_completed', false)->count();

                    return [
                        'session_number' => $index + 1,
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

                $status = 'complete';
                if ($dailyTotalHours < $requiredWorkHours) {
                    $status = 'incomplete';
                } elseif ($dailyTotalHours > $requiredWorkHours) {
                    $status = 'overtime';
                }

                $dailyDetails[] = [
                    'date' => $date,
                    'daily_total_hours' => round($dailyTotalHours, 2),
                    'overtime_hours' => round($dailyOvertimeHours, 2),
                    'status' => $status,
                    'sessions' => $sessions,
                ];
            }

            // Sort daily details by date descending (newest first)
            usort($dailyDetails, function ($a, $b) {
                return strcmp($b['date'], $a['date']);
            });

            $employeeReports[] = [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                ],
                'total_hours' => round($totalHours, 2),
                'total_overtime_hours' => round($totalOvertimeHours, 2),
                'total_days_worked' => $totalDaysWorked,
                'daily_details' => $dailyDetails,
            ];
        }

        // Sort by employee name
        usort($employeeReports, function ($a, $b) {
            return strcmp($a['employee']['name'], $b['employee']['name']);
        });

        return [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'required_hours' => $requiredWorkHours,
            'employees' => $employeeReports,
        ];
    }
}

