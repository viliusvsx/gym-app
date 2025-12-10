<?php

namespace App\Http\Requests\Workouts;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkoutSessionRequest extends FormRequest
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
            'performed_at' => ['required', 'date'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'program_block_id' => ['nullable', 'exists:program_blocks,id'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'sets' => ['required', 'array', 'min:1'],
            'sets.*.exercise_id' => [
                'required',
                Rule::exists('exercises', 'id')->where(fn ($query) => $query
                    ->whereNull('user_id')
                    ->orWhere('user_id', $this->user()->id)),
            ],
            'sets.*.sequence' => ['required', 'integer', 'min:1'],
            'sets.*.reps' => ['nullable', 'integer', 'min:0', 'max:100'],
            'sets.*.weight_kg' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'sets.*.rpe' => ['nullable', 'numeric', 'between:5,10'],
            'sets.*.rir' => ['nullable', 'numeric', 'between:0,5'],
            'sets.*.percentage_of_one_rm' => ['nullable', 'numeric', 'between:0,110'],
            'sets.*.is_warmup' => ['boolean'],
            'sets.*.rest_seconds' => ['nullable', 'integer', 'min:0', 'max:1800'],
            'sets.*.tempo' => ['nullable', 'string', 'max:50'],
            'sets.*.notes' => ['nullable', 'string', 'max:500'],
            'sets.*.superset_label' => ['nullable', 'string', 'max:50'],
        ];
    }
}
