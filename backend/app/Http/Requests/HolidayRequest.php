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
        
        // Build unique rule: exclude current holiday ID only when updating
        $dateRule = 'required|date|unique:holidays,date';
        if ($holidayId !== null) {
            $dateRule .= ',' . $holidayId;
        }
        
        return [
            'date' => $dateRule,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ];
    }
}
