<?php

namespace Database\Factories;

use App\Models\ClassTimeSlot;
use App\Models\GymClass;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<ClassTimeSlot>
 */
class ClassTimeSlotFactory extends Factory
{
    protected $model = ClassTimeSlot::class;

    public function definition(): array
    {
        $start = Carbon::now()->addDays(1)->setTime(9, 0);

        return [
            'gym_class_id' => GymClass::factory(),
            'starts_at' => $start,
            'ends_at' => (clone $start)->addHour(),
            'capacity' => 12,
            'allow_waitlist' => true,
            'location' => $this->faker->city(),
        ];
    }
}
