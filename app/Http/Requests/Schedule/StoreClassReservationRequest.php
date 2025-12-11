<?php

namespace App\Http\Requests\Schedule;

use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use App\Rules\OverlappingReservationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('create', ClassReservation::class);
    }

    public function rules(): array
    {
        $timeSlotId = (int) $this->input('class_time_slot_id');
        $timeSlot = ClassTimeSlot::find($timeSlotId);

        $classTimeSlotRules = ['required', 'exists:class_time_slots,id'];

        if ($timeSlot) {
            $classTimeSlotRules[] = new OverlappingReservationRule($timeSlot, $this->user()?->id ?? 0);
        }

        return [
            'class_time_slot_id' => $classTimeSlotRules,
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
