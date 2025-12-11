<?php

use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use App\Models\User;
use App\Rules\OverlappingReservationRule;
use Illuminate\Support\Carbon;

it('fails when overlapping reservation exists', function () {
    $user = User::factory()->create();

    $existingSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(9, 0),
        'ends_at' => Carbon::now()->addDay()->setTime(10, 0),
    ]);

    ClassReservation::factory()->create([
        'class_time_slot_id' => $existingSlot->id,
        'user_id' => $user->id,
        'status' => ClassReservation::STATUS_CONFIRMED,
    ]);

    $newSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(9, 30),
        'ends_at' => Carbon::now()->addDay()->setTime(10, 30),
    ]);

    $rule = new OverlappingReservationRule($newSlot, $user->id);

    $failed = false;
    $rule->validate('class_time_slot_id', $newSlot->id, function () use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeTrue();
});

it('passes when reservation does not overlap', function () {
    $user = User::factory()->create();

    $existingSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(6, 0),
        'ends_at' => Carbon::now()->addDay()->setTime(7, 0),
    ]);

    ClassReservation::factory()->create([
        'class_time_slot_id' => $existingSlot->id,
        'user_id' => $user->id,
        'status' => ClassReservation::STATUS_CONFIRMED,
    ]);

    $newSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(8, 0),
        'ends_at' => Carbon::now()->addDay()->setTime(9, 0),
    ]);

    $rule = new OverlappingReservationRule($newSlot, $user->id);

    $failed = false;
    $rule->validate('class_time_slot_id', $newSlot->id, function () use (&$failed): void {
        $failed = true;
    });

    expect($failed)->toBeFalse();
});
