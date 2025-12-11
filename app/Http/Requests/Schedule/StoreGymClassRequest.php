<?php

namespace App\Http\Requests\Schedule;

use App\Models\GymClass;
use Illuminate\Foundation\Http\FormRequest;

class StoreGymClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('create', GymClass::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'default_capacity' => ['required', 'integer', 'min:1'],
            'waitlist_enabled' => ['boolean'],
            'time_slots' => ['array'],
            'time_slots.*.starts_at' => ['required', 'date'],
            'time_slots.*.ends_at' => ['required', 'date', 'after:time_slots.*.starts_at'],
            'time_slots.*.capacity' => ['nullable', 'integer', 'min:1'],
            'time_slots.*.allow_waitlist' => ['boolean'],
            'time_slots.*.location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
