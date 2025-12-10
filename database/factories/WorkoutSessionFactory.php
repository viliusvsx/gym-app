<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\ProgramBlock;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkoutSession>
 */
class WorkoutSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $program = Program::factory();

        return [
            'user_id' => User::factory(),
            'program_id' => $program,
            'program_block_id' => ProgramBlock::factory()->for($program, 'program'),
            'name' => $this->faker->randomElement(['Lower', 'Upper', 'Full Body']).' Session',
            'performed_at' => now()->subDays($this->faker->numberBetween(0, 14)),
            'duration_seconds' => $this->faker->numberBetween(1800, 5400),
            'notes' => $this->faker->sentence(),
        ];
    }
}
