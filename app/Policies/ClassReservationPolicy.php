<?php

namespace App\Policies;

use App\Models\ClassReservation;
use App\Models\User;

class ClassReservationPolicy
{
    public function create(User $user): bool
    {
        return $user !== null;
    }

    public function delete(User $user, ClassReservation $reservation): bool
    {
        return $user->id === $reservation->user_id
            || $user->id === $reservation->timeSlot?->gymClass?->coach_id;
    }
}
