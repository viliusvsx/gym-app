<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BodyMetric>
 */
class BodyMetricFactory extends Factory
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
            'recorded_at' => now()->subDays($this->faker->numberBetween(0, 14))->toDateString(),
            'weight_kg' => $this->faker->randomFloat(2, 60, 95),
            'body_fat_percent' => $this->faker->randomFloat(2, 10, 20),
            'waist_cm' => $this->faker->randomFloat(2, 70, 95),
            'chest_cm' => $this->faker->randomFloat(2, 90, 120),
            'hips_cm' => $this->faker->randomFloat(2, 90, 120),
            'arm_cm' => $this->faker->randomFloat(2, 30, 45),
            'thigh_cm' => $this->faker->randomFloat(2, 50, 70),
            'notes' => $this->faker->sentence(),
        ];
    }
}
