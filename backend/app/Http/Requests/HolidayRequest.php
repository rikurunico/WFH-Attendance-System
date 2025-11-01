<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HolidayRequest extends FormRequest
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
        $holidayId = $this->route('id');
        
        return [
            'date' => 'required|date|unique:holidays,date,' . $holidayId,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ];
    }
}
