<?php

namespace App\Http\Requests\Programs;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
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
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'is_active' => ['boolean'],
            'blocks' => ['nullable', 'array', 'max:12'],
            'blocks.*.title' => ['required_with:blocks', 'string', 'max:255'],
            'blocks.*.week_count' => ['nullable', 'integer', 'min:1', 'max:12'],
            'blocks.*.is_deload' => ['boolean'],
            'blocks.*.sequence' => ['nullable', 'integer', 'min:1', 'max:50'],
            'blocks.*.focus' => ['nullable', 'string', 'max:255'],
        ];
    }
}
