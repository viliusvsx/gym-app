<?php

namespace App\Policies;

use App\Models\Habit;
use App\Models\User;

class HabitPolicy
{
    public function view(User $user, Habit $habit): bool
    {
        return $habit->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Habit $habit): bool
    {
        return $this->view($user, $habit);
    }

    public function delete(User $user, Habit $habit): bool
    {
        return $this->view($user, $habit);
    }
}
