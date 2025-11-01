<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmployeeReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    public function myReport(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);

            $report = $this->reportService->getEmployeeReport($user, $startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => $report,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get employee report failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get report',
            ], 500);
        }
    }
}
