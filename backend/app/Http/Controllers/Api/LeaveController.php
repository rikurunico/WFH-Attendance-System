<?php

namespace App\Http\Controllers\Api;

use App\Enums\LeaveStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveRequest;
use App\Http\Resources\LeaveResource;
use App\Models\Leave;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class LeaveController extends Controller
{
    public function store(LeaveRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();

            $leave = Leave::create([
                'user_id' => $user->id,
                'start_date' => $request->validated()['start_date'],
                'end_date' => $request->validated()['end_date'],
                'reason' => $request->validated()['reason'],
                'status' => LeaveStatus::PENDING,
            ]);

            return response()->json([
                'success' => true,
                'data' => new LeaveResource($leave->load('user')),
                'message' => 'Leave request submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create leave request failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit leave request',
            ], 500);
        }
    }

    public function myRequests(): JsonResponse
    {
        try {
            $user = auth()->user();
            $leaves = Leave::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => LeaveResource::collection($leaves),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get leave requests failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get leave requests',
            ], 500);
        }
    }
}
