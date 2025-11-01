<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UserManagementController extends Controller
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function index(): JsonResponse
    {
        try {
            $users = $this->userRepository->getAll();

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users),
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
}
