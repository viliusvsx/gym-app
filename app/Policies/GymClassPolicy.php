<?php

namespace App\Policies;

use App\Models\GymClass;
use App\Models\User;

class GymClassPolicy
{
    public function create(User $user): bool
    {
        return $user !== null;
    }

    public function update(User $user, GymClass $gymClass): bool
    {
        return $user->id === $gymClass->coach_id;
    }
}
