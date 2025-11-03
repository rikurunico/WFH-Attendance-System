<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isManager();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id');
        
        // Build unique rule: exclude current user ID only when updating
        $emailRule = 'required|email|unique:users,email';
        if ($userId !== null) {
            $emailRule .= ',' . $userId;
        }
        
        return [
            'name' => 'required|string|max:255',
            'email' => $emailRule,
            'password' => $this->isMethod('post') ? 'required|min:8|confirmed' : 'sometimes|min:8|confirmed',
            'role' => 'required|in:manager,employee',
        ];
    }
}
