<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public registration
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'team_name' => 'required|string|max:255',
            'team_description' => 'nullable|string|max:1000',
            'required_work_hours' => 'nullable|numeric|min:1|max:24',
            'default_leave_quota_days' => 'nullable|integer|min:0|max:365',
            'max_leave_days_per_month' => 'nullable|integer|min:0|max:31',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'team_name.required' => 'Nama tim wajib diisi',
            'required_work_hours.numeric' => 'Jam kerja harus berupa angka',
            'required_work_hours.min' => 'Jam kerja minimal 1 jam',
            'required_work_hours.max' => 'Jam kerja maksimal 24 jam',
            'default_leave_quota_days.integer' => 'Jatah cuti harus berupa angka',
            'default_leave_quota_days.min' => 'Jatah cuti minimal 0 hari',
            'default_leave_quota_days.max' => 'Jatah cuti maksimal 365 hari',
            'max_leave_days_per_month.integer' => 'Maksimal cuti per bulan harus berupa angka',
            'max_leave_days_per_month.min' => 'Maksimal cuti per bulan minimal 0 hari',
            'max_leave_days_per_month.max' => 'Maksimal cuti per bulan maksimal 31 hari',
        ];
    }
}
