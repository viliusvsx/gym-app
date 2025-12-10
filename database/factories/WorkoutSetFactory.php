<?php

namespace Database\Factories;

use App\Models\Exercise;
use App\Models\WorkoutSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkoutSet>
 */
class WorkoutSetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workout_session_id' => WorkoutSession::factory(),
            'exercise_id' => Exercise::factory(),
            'sequence' => $this->faker->numberBetween(1, 5),
            'reps' => $this->faker->numberBetween(3, 12),
            'weight_kg' => $this->faker->randomFloat(2, 20, 180),
            'rpe' => $this->faker->randomFloat(2, 6, 10),
            'rir' => null,
            'percentage_of_one_rm' => $this->faker->randomFloat(2, 60, 90),
            'is_warmup' => false,
            'rest_seconds' => $this->faker->numberBetween(60, 180),
            'tempo' => '3010',
        ];
    }
}
