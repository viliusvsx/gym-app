<?php

namespace App\Http\Requests\Habits;

use App\Enums\HabitLogStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHabitLogRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'logged_for' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['required', Rule::enum(HabitLogStatus::class)],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
