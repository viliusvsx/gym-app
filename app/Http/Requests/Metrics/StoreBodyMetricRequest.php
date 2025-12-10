<?php

namespace App\Http\Requests\Metrics;

use Illuminate\Foundation\Http\FormRequest;

class StoreBodyMetricRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recorded_at' => ['required', 'date'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'body_fat_percent' => ['nullable', 'numeric', 'between:0,100'],
            'waist_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'chest_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'hips_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'arm_cm' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'thigh_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['image', 'max:10240'],
        ];
    }
}
