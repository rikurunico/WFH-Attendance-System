<?php

namespace App\Http\Controllers\Api;

use App\Enums\ActivityType;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Repositories\ActivityLogRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActivityLogController extends Controller
{
    public function __construct(
        private ActivityLogRepository $activityLogRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $userId = $request->get('user_id');
            $action = $request->get('action');
            $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
            $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;

            $activityType = $action ? ActivityType::from($action) : null;

            $logs = $this->activityLogRepository->getWithFilters(
                $userId,
                $activityType,
                $startDate,
                $endDate,
                50
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'logs' => ActivityLogResource::collection($logs->load('user')),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get activity logs failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get activity logs',
            ], 500);
        }
    }
}
