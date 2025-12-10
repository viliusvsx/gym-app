<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProgramBlock>
 */
class ProgramBlockFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'title' => 'Block '.$this->faker->randomDigitNotNull(),
            'week_count' => $this->faker->numberBetween(3, 6),
            'is_deload' => false,
            'sequence' => 1,
            'focus' => $this->faker->randomElement(['Volume', 'Intensity', 'Technique']),
        ];
    }
}
