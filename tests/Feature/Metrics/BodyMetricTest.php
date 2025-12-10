<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('body metrics with photos can be stored', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('metrics.store'), [
        'recorded_at' => now()->toDateString(),
        'weight_kg' => 82.5,
        'body_fat_percent' => 14.2,
        'waist_cm' => 82.5,
        'notes' => 'Feeling fresh',
        'photos' => [
            UploadedFile::fake()->image('progress.jpg')->size(5000),
        ],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('body_metrics', [
        'user_id' => $user->id,
        'weight_kg' => 82.5,
    ]);

    $this->assertDatabaseCount('body_photos', 1);

    Storage::disk('public')->assertExists(
        \App\Models\BodyPhoto::first()->path
    );
});
