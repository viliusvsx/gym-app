<?php

use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use App\Models\GymClass;
use App\Models\User;
use Illuminate\Support\Carbon;

it('allows creating a class with time slots', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post('/classes', [
            'title' => 'Power Hour',
            'description' => 'High energy class',
            'default_capacity' => 8,
            'waitlist_enabled' => true,
            'time_slots' => [
                [
                    'starts_at' => Carbon::now()->addDay()->setTime(7, 0),
                    'ends_at' => Carbon::now()->addDay()->setTime(8, 0),
                    'capacity' => 8,
                    'allow_waitlist' => true,
                    'location' => 'Studio A',
                ],
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(GymClass::query()->where('title', 'Power Hour')->exists())->toBeTrue();
    expect(ClassTimeSlot::query()->where('location', 'Studio A')->count())->toBe(1);
});

it('waitlists when capacity is full', function () {
    $coach = User::factory()->create();
    $member = User::factory()->create();

    $gymClass = GymClass::factory()->for($coach, 'coach')->create(['default_capacity' => 1]);
    $slot = ClassTimeSlot::factory()->for($gymClass)->create([
        'capacity' => 1,
        'starts_at' => Carbon::now()->addDay()->setTime(17, 0),
        'ends_at' => Carbon::now()->addDay()->setTime(18, 0),
    ]);

    ClassReservation::factory()->create([
        'class_time_slot_id' => $slot->id,
        'status' => ClassReservation::STATUS_CONFIRMED,
    ]);

    actingAs($member)
        ->post('/reservations', [
            'class_time_slot_id' => $slot->id,
        ])
        ->assertSessionHasNoErrors();

    $reservation = ClassReservation::query()->where('user_id', $member->id)->first();

    expect($reservation?->status)->toBe(ClassReservation::STATUS_WAITLISTED);
});

it('prevents overlapping reservations', function () {
    $member = User::factory()->create();
    $firstSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(9, 0),
        'ends_at' => Carbon::now()->addDay()->setTime(10, 0),
    ]);

    ClassReservation::factory()->create([
        'class_time_slot_id' => $firstSlot->id,
        'user_id' => $member->id,
    ]);

    $overlapSlot = ClassTimeSlot::factory()->create([
        'starts_at' => Carbon::now()->addDay()->setTime(9, 30),
        'ends_at' => Carbon::now()->addDay()->setTime(10, 30),
    ]);

    actingAs($member)
        ->post('/reservations', [
            'class_time_slot_id' => $overlapSlot->id,
        ])
        ->assertSessionHasErrors('class_time_slot_id');
});

it('allows rescinding reservations', function () {
    $member = User::factory()->create();
    $reservation = ClassReservation::factory()->for($member)->create([
        'status' => ClassReservation::STATUS_CONFIRMED,
    ]);

    actingAs($member)
        ->delete("/reservations/{$reservation->id}")
        ->assertSessionHas('status');

    expect($reservation->fresh()->status)->toBe(ClassReservation::STATUS_CANCELLED);
});
