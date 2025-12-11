<?php

use App\Jobs\SendHabitReminder;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function (): void {
    User::query()
        ->whereHas('habits', fn ($query) => $query->where('reminder_enabled', true))
        ->each(fn (User $user) => SendHabitReminder::dispatch($user->id));
})
    ->name('habit-reminders')
    ->dailyAt('07:00');
