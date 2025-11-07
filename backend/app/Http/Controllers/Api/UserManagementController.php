<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserManagementController extends Controller
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function index(): JsonResponse
    {
        try {
            $perPage = request()->get('per_page', 10);
            
            // Validate per_page parameter
            $perPage = in_array($perPage, [10, 50, 100, 1000]) ? $perPage : 10;
            
            $users = $this->userRepository->getPaginated($perPage);

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users->items()),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get users failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get users',
            ], 500);
        }
    }

    public function store(UserRequest $request): JsonResponse
    {
        try {
            $user = $this->userRepository->create($request->validated());

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'User created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create user failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
            ], 500);
        }
    }

    public function update(UserRequest $request, int $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $this->userRepository->update($user, $request->validated());

            return response()->json([
                'success' => true,
                'data' => new UserResource($user->fresh()),
                'message' => 'User updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update user failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $this->userRepository->delete($user);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete user failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $search = $request->get('q', '');
            $limit = $request->get('limit', 10);

            if (empty($search)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ], 200);
            }

            $users = $this->userRepository->searchByName($search, $limit);

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Search users failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to search users',
            ], 500);
        }
    }
}
