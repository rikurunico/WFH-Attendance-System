<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HolidayRequest;
use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HolidayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $year = $request->get('year', now()->year);
            $holidays = Holiday::whereYear('date', $year)->orderBy('date')->get();

            return response()->json([
                'success' => true,
                'data' => HolidayResource::collection($holidays),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get holidays failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get holidays',
            ], 500);
        }
    }

    public function store(HolidayRequest $request): JsonResponse
    {
        try {
            $holiday = Holiday::create($request->validated());

            return response()->json([
                'success' => true,
                'data' => new HolidayResource($holiday),
                'message' => 'Holiday created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create holiday failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create holiday',
            ], 500);
        }
    }

    public function update(HolidayRequest $request, int $id): JsonResponse
    {
        try {
            $holiday = Holiday::findOrFail($id);
            $holiday->update($request->validated());

            return response()->json([
                'success' => true,
                'data' => new HolidayResource($holiday->fresh()),
                'message' => 'Holiday updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update holiday failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update holiday',
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $holiday = Holiday::findOrFail($id);
            $holiday->delete();

            return response()->json([
                'success' => true,
                'message' => 'Holiday deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete holiday failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete holiday',
            ], 500);
        }
    }
}
