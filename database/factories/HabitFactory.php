<?php

namespace Database\Factories;

use App\Enums\HabitStatus;
use App\Models\Habit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Habit>
 */
class HabitFactory extends Factory
{
    protected $model = Habit::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => ucfirst(fake()->word()),
            'description' => fake()->sentence(),
            'status' => HabitStatus::Active,
            'target_per_week' => fake()->numberBetween(3, 7),
            'reminder_time' => '07:00:00',
            'reminder_enabled' => fake()->boolean(60),
        ];
    }
}
