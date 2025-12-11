<?php

namespace App\Http\Controllers\Habits;

use App\Enums\HabitLogStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Habits\StoreHabitLogRequest;
use App\Models\Habit;
use App\Models\HabitLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class HabitLogController extends Controller
{
    public function store(StoreHabitLogRequest $request, Habit $habit): RedirectResponse
    {
        Gate::authorize('update', $habit);

        $data = $request->validated();
        $user = $request->user();

        HabitLog::updateOrCreate(
            [
                'habit_id' => $habit->id,
                'logged_for' => $data['logged_for'],
            ],
            [
                'user_id' => $user->id,
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
                'completed_at' => $data['status'] === HabitLogStatus::Completed->value
                    ? now()
                    : null,
            ],
        );

        return back()->with('status', 'Habit log updated.');
    }
}
