<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
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
            'tasks' => 'required|array|min:1|max:20',
            'tasks.*.title' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'tasks.required' => 'You must provide at least one task.',
            'tasks.min' => 'You must provide at least one task.',
            'tasks.max' => 'You cannot provide more than 20 tasks.',
            'tasks.*.title.required' => 'Each task must have a title.',
            'tasks.*.title.max' => 'Task title cannot exceed 255 characters.',
        ];
    }
}
