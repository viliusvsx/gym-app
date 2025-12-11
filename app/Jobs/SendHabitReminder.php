<?php

namespace App\Jobs;

use App\Enums\HabitLogStatus;
use App\Models\User;
use App\Notifications\HabitReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendHabitReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId)
    {
    }

    public function handle(): void
    {
        /** @var User|null $user */
        $user = User::query()
            ->with(['habits.logs' => fn ($query) => $query->whereDate('logged_for', now()->toDateString())])
            ->find($this->userId);

        if (! $user) {
            return;
        }

        $habits = $user->habits
            ->where('reminder_enabled', true)
            ->filter(function ($habit) {
                $todayLog = $habit->logs->first();

                return ! $todayLog || $todayLog->status !== HabitLogStatus::Completed;
            });

        if ($habits->isEmpty()) {
            return;
        }

        $user->notify(new HabitReminderNotification($habits->values()));
    }
}
