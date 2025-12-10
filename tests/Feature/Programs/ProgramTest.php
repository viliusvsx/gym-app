<?php

use App\Models\User;

test('programs can be created with an initial block', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Base Strength',
        'description' => '4-week base block',
        'starts_on' => now()->toDateString(),
        'ends_on' => now()->addWeeks(4)->toDateString(),
        'is_active' => true,
        'blocks' => [
            [
                'title' => 'Foundation',
                'week_count' => 4,
                'is_deload' => false,
                'sequence' => 1,
                'focus' => 'Volume',
            ],
        ],
    ];

    $this->actingAs($user)
        ->post(route('programs.store'), $payload)
        ->assertRedirect();

    $this->assertDatabaseHas('programs', [
        'name' => 'Base Strength',
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('program_blocks', [
        'title' => 'Foundation',
        'sequence' => 1,
    ]);
});
