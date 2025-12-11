<?php

use App\Enums\HabitLogStatus;
use App\Models\Habit;
use App\Models\User;

use function Pest\Laravel\actingAs;

test('a user can create a habit and log progress', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post(route('habits.store'), [
            'name' => 'Morning walk',
            'description' => '15 minutes outside',
            'status' => 'active',
            'target_per_week' => 5,
            'reminder_time' => '07:00',
            'reminder_enabled' => true,
        ])
        ->assertRedirect();

    $habit = Habit::where('user_id', $user->id)->first();

    expect($habit)->not->toBeNull();

    actingAs($user)
        ->post(route('habits.logs.store', $habit), [
            'logged_for' => now()->toDateString(),
            'status' => HabitLogStatus::Completed->value,
            'notes' => 'Finished before breakfast',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('habit_logs', [
        'habit_id' => $habit->id,
        'user_id' => $user->id,
        'status' => HabitLogStatus::Completed->value,
    ]);
});

test('users cannot log habits that are not theirs', function () {
    $habit = Habit::factory()->create();
    $otherUser = User::factory()->create();

    actingAs($otherUser)
        ->post(route('habits.logs.store', $habit), [
            'logged_for' => now()->toDateString(),
            'status' => HabitLogStatus::Completed->value,
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('habit_logs', 0);
});
