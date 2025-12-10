<?php

namespace App\Http\Requests\Exercises;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExerciseRequest extends FormRequest
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
            'category' => ['nullable', 'string', 'max:255'],
            'equipment' => ['nullable', 'string', 'max:255'],
            'primary_muscles' => ['nullable', 'array'],
            'primary_muscles.*' => ['string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'video_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
