<?php

namespace App\Console;

use App\Jobs\SendHabitReminder;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function (): void {
            User::query()
                ->whereHas('habits', fn ($query) => $query->where('reminder_enabled', true))
                ->each(fn (User $user) => SendHabitReminder::dispatch($user->id));
        })
            ->name('habit-reminders')
            ->dailyAt('07:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
