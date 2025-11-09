<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceEditRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->isManager() || auth()->user()->isSuperAdmin());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'check_in' => 'required|date',
            'check_out' => 'nullable|date|after:check_in',
            'reason' => 'required|string|min:10',
        ];
    }

    public function messages(): array
    {
        return [
            'check_in.required' => 'Check-in time is required.',
            'check_out.after' => 'Check-out time must be after check-in time.',
            'reason.required' => 'Reason is required for audit purposes.',
            'reason.min' => 'Reason must be at least 10 characters.',
        ];
    }
}
