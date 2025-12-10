<?php

namespace Database\Factories;

use App\Models\BodyMetric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BodyPhoto>
 */
class BodyPhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'body_metric_id' => BodyMetric::factory(),
            'path' => 'photos/'.$this->faker->uuid().'.jpg',
            'caption' => $this->faker->sentence(3),
            'sequence' => 1,
            'taken_at' => now(),
        ];
    }
}
