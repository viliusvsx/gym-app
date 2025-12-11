<?php

namespace App\Rules;

use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class OverlappingReservationRule implements ValidationRule
{
    public function __construct(private readonly ClassTimeSlot $timeSlot, private readonly int $userId)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $conflict = ClassReservation::query()
            ->where('user_id', $this->userId)
            ->whereIn('status', [
                ClassReservation::STATUS_CONFIRMED,
                ClassReservation::STATUS_WAITLISTED,
            ])
            ->whereHas('timeSlot', function ($query): void {
                $query->where(function ($slotQuery): void {
                    $slotQuery
                        ->whereBetween('starts_at', [$this->timeSlot->starts_at, $this->timeSlot->ends_at])
                        ->orWhereBetween('ends_at', [$this->timeSlot->starts_at, $this->timeSlot->ends_at])
                        ->orWhere(function ($rangeQuery): void {
                            $rangeQuery
                                ->where('starts_at', '<=', $this->timeSlot->starts_at)
                                ->where('ends_at', '>=', $this->timeSlot->ends_at);
                        });
                });
            })
            ->exists();

        if ($conflict) {
            $fail('You already have a reservation that overlaps this time.');
        }
    }
}
