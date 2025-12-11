<?php

namespace Database\Factories;

use App\Enums\HabitLogStatus;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HabitLog>
 */
class HabitLogFactory extends Factory
{
    protected $model = HabitLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'habit_id' => Habit::factory(),
            'user_id' => User::factory(),
            'logged_for' => now()->toDateString(),
            'status' => HabitLogStatus::Completed,
            'notes' => fake()->sentence(),
            'completed_at' => now(),
        ];
    }
}
