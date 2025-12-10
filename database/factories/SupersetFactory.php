<?php

namespace Database\Factories;

use App\Models\WorkoutSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Superset>
 */
class SupersetFactory extends Factory
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
            'label' => 'Superset '.$this->faker->randomDigitNotNull(),
            'sequence' => 1,
        ];
    }
}
