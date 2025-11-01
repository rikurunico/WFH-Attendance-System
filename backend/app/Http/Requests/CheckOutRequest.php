<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckOutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'attendance_id' => 'required|exists:attendances,id',
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:tasks,id',
            'tasks.*.is_completed' => 'required|boolean',
            'tasks.*.blocker_reason' => 'required_if:tasks.*.is_completed,false|string|max:500|nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'attendance_id.required' => 'Attendance ID is required.',
            'attendance_id.exists' => 'Attendance record not found.',
            'tasks.required' => 'Tasks are required.',
            'tasks.*.id.required' => 'Task ID is required.',
            'tasks.*.id.exists' => 'Task not found.',
            'tasks.*.is_completed.required' => 'Task completion status is required.',
            'tasks.*.is_completed.boolean' => 'Task completion status must be true or false.',
            'tasks.*.blocker_reason.required_if' => 'Blocker reason is required when task is incomplete.',
            'tasks.*.blocker_reason.max' => 'Blocker reason cannot exceed 500 characters.',
        ];
    }
}
