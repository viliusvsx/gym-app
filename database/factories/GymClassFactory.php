<?php

namespace Database\Factories;

use App\Models\GymClass;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GymClass>
 */
class GymClassFactory extends Factory
{
    protected $model = GymClass::class;

    public function definition(): array
    {
        return [
            'coach_id' => User::factory(),
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'default_capacity' => 12,
            'waitlist_enabled' => true,
        ];
    }
}
