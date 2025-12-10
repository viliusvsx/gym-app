<?php

use App\Models\Exercise;
use App\Models\Superset;
use App\Models\User;

test('a workout with sets and supersets can be logged', function () {
    $user = User::factory()->create();
    $exercises = Exercise::factory()->count(2)->for($user)->create();

    $payload = [
        'name' => 'Test Session',
        'performed_at' => now()->toIso8601String(),
        'duration_seconds' => 1800,
        'sets' => [
            [
                'exercise_id' => $exercises[0]->id,
                'sequence' => 1,
                'reps' => 5,
                'weight_kg' => 80,
                'rpe' => 8,
                'superset_label' => 'A',
            ],
            [
                'exercise_id' => $exercises[1]->id,
                'sequence' => 2,
                'reps' => 10,
                'weight_kg' => 40,
                'rpe' => 7.5,
                'is_warmup' => true,
                'superset_label' => 'A',
            ],
        ],
    ];

    $this->actingAs($user)
        ->post(route('workouts.store'), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('workout_sessions', [
        'name' => 'Test Session',
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseCount('workout_sets', 2);
    $this->assertDatabaseHas('workout_sets', [
        'exercise_id' => $exercises[0]->id,
        'reps' => 5,
    ]);

    expect(Superset::first())->not->toBeNull();
});
