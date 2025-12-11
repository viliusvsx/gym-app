<?php

namespace App\Http\Controllers\Schedule;

use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreClassReservationRequest;
use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use Illuminate\Http\RedirectResponse;

class ReservationController extends Controller
{
    public function store(StoreClassReservationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $this->authorize('create', ClassReservation::class);

        /** @var ClassTimeSlot $timeSlot */
        $timeSlot = ClassTimeSlot::with('gymClass', 'reservations')->findOrFail($data['class_time_slot_id']);

        $confirmedCount = $timeSlot->reservations->where('status', ClassReservation::STATUS_CONFIRMED)->count();
        $capacity = $timeSlot->capacity ?? $timeSlot->gymClass->default_capacity;
        $allowWaitlist = $timeSlot->allow_waitlist && $timeSlot->gymClass->waitlist_enabled;

        $status = $confirmedCount >= $capacity
            ? ($allowWaitlist ? ClassReservation::STATUS_WAITLISTED : ClassReservation::STATUS_CANCELLED)
            : ClassReservation::STATUS_CONFIRMED;

        if ($status === ClassReservation::STATUS_CANCELLED) {
            return back()->withErrors(['class_time_slot_id' => 'This class is full and waitlists are disabled.']);
        }

        $reservation = ClassReservation::query()->updateOrCreate(
            [
                'class_time_slot_id' => $timeSlot->id,
                'user_id' => $user->id,
            ],
            [
                'status' => $status,
            ],
        );

        return back()->with('status', $reservation->status === ClassReservation::STATUS_CONFIRMED ? 'Reservation confirmed.' : 'Added to waitlist.');
    }

    public function destroy(ClassReservation $reservation): RedirectResponse
    {
        $this->authorize('delete', $reservation);

        $reservation->status = ClassReservation::STATUS_CANCELLED;
        $reservation->save();

        return back()->with('status', 'Reservation rescinded.');
    }
}
