<?php

namespace Database\Factories;

use App\Models\WorkoutSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'workout_session_id' => $this->faker->boolean(40)
                ? WorkoutSession::factory()
                : null,
        ];
    }
}
