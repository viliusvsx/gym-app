<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exercise>
 */
class ExerciseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->unique()->words(2, true),
            'category' => $this->faker->randomElement(['Strength', 'Accessory', 'Conditioning']),
            'equipment' => $this->faker->randomElement(['Barbell', 'Dumbbell', 'Machine', 'Bodyweight']),
            'primary_muscles' => $this->faker->randomElements(
                ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
                2
            ),
            'is_custom' => true,
            'notes' => $this->faker->sentence(),
        ];
    }
}
