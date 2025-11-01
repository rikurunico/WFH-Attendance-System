<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ManagerReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        try {
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));
            $date = Carbon::parse($date);

            $dashboard = $this->reportService->getManagerDashboard($date);

            return response()->json([
                'success' => true,
                'data' => $dashboard,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get manager dashboard failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard',
            ], 500);
        }
    }

    public function employeeReport(Request $request, int $userId): JsonResponse
    {
        try {
            $employee = User::findOrFail($userId);

            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);

            $report = $this->reportService->getEmployeeReportForManager($employee, $startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => $report,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get employee report failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get employee report',
            ], 500);
        }
    }
}
