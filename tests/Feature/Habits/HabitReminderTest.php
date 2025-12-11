<?php

use App\Enums\HabitLogStatus;
use App\Jobs\SendHabitReminder;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\User;
use App\Notifications\HabitReminderNotification;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\artisan;

test('habit reminder job is scheduled daily', function () {
    Queue::fake();

    $user = User::factory()->create();
    Habit::factory()->for($user)->create(['reminder_enabled' => true]);

    Date::setTestNow(now()->startOfDay()->addHours(7));

    artisan('schedule:run');

    Queue::assertPushed(SendHabitReminder::class, fn ($job) => $job->userId === $user->id);

    Date::setTestNow();
});

test('habit reminder notification only includes incomplete habits', function () {
    Notification::fake();

    $user = User::factory()->create();
    $completedHabit = Habit::factory()->for($user)->create([
        'reminder_enabled' => true,
        'reminder_time' => '08:00',
    ]);
    Habit::factory()->for($user)->create([
        'name' => 'Stretching',
        'reminder_enabled' => true,
    ]);

    HabitLog::factory()->for($completedHabit)->for($user)->create([
        'logged_for' => now()->toDateString(),
        'status' => HabitLogStatus::Completed,
    ]);

    (new SendHabitReminder($user->id))->handle();

    Notification::assertSentToTimes($user, HabitReminderNotification::class, 1);
});

test('users with all habits completed are not notified', function () {
    Notification::fake();

    $user = User::factory()->create();
    $habit = Habit::factory()->for($user)->create(['reminder_enabled' => true]);

    HabitLog::factory()->for($habit)->for($user)->create([
        'logged_for' => now()->toDateString(),
        'status' => HabitLogStatus::Completed,
    ]);

    (new SendHabitReminder($user->id))->handle();

    Notification::assertNothingSent();
});
