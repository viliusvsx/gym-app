<?php

namespace App\Policies;

use App\Models\HabitLog;
use App\Models\User;

class HabitLogPolicy
{
    public function view(User $user, HabitLog $habitLog): bool
    {
        return $habitLog->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, HabitLog $habitLog): bool
    {
        return $this->view($user, $habitLog);
    }

    public function delete(User $user, HabitLog $habitLog): bool
    {
        return $this->view($user, $habitLog);
    }
}
