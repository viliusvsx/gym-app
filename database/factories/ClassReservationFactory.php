<?php

namespace Database\Factories;

use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClassReservation>
 */
class ClassReservationFactory extends Factory
{
    protected $model = ClassReservation::class;

    public function definition(): array
    {
        return [
            'class_time_slot_id' => ClassTimeSlot::factory(),
            'user_id' => User::factory(),
            'status' => ClassReservation::STATUS_CONFIRMED,
        ];
    }
}
