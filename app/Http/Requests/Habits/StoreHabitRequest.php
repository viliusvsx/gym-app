<?php

namespace App\Http\Requests\Habits;

use App\Enums\HabitStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHabitRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::enum(HabitStatus::class)],
            'target_per_week' => ['required', 'integer', 'min:1', 'max:14'],
            'reminder_time' => ['nullable', 'date_format:H:i'],
            'reminder_enabled' => ['boolean'],
        ];
    }
}
