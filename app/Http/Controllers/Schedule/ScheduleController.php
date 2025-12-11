<?php

namespace App\Http\Controllers\Schedule;

use App\Http\Controllers\Controller;
use App\Models\ClassReservation;
use App\Models\ClassTimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $timeSlots = ClassTimeSlot::query()
            ->with(['gymClass.coach', 'reservations'])
            ->where('starts_at', '>=', now()->subDay())
            ->orderBy('starts_at')
            ->get()
            ->map(function (ClassTimeSlot $slot) use ($user) {
                $activeReservations = $slot->reservations->where('status', '!=', ClassReservation::STATUS_CANCELLED);
                $confirmed = $activeReservations->where('status', ClassReservation::STATUS_CONFIRMED)->count();
                $waitlisted = $activeReservations->where('status', ClassReservation::STATUS_WAITLISTED)->count();
                $capacity = $slot->capacity ?? $slot->gymClass->default_capacity;

                return [
                    'id' => $slot->id,
                    'title' => $slot->gymClass->title,
                    'starts_at' => $slot->starts_at?->toIso8601String(),
                    'ends_at' => $slot->ends_at?->toIso8601String(),
                    'location' => $slot->location,
                    'coach' => $slot->gymClass->coach?->name,
                    'capacity' => $capacity,
                    'remaining' => max($capacity - $confirmed, 0),
                    'waitlisted' => $waitlisted,
                    'allow_waitlist' => $slot->allow_waitlist && $slot->gymClass->waitlist_enabled,
                    'reservation' => $slot->reservations
                        ->firstWhere('user_id', $user->id)
                        ?->only(['id', 'status']),
                ];
            });

        $coachSummary = $user->gymClasses()
            ->with(['timeSlots.reservations'])
            ->get()
            ->map(function ($gymClass) {
                $upcomingSlots = $gymClass->timeSlots->filter(fn ($slot) => $slot->starts_at?->isFuture());
                $confirmed = $upcomingSlots->flatMap->reservations->where('status', 'confirmed')->count();
                $waitlisted = $upcomingSlots->flatMap->reservations->where('status', 'waitlisted')->count();

                return [
                    'id' => $gymClass->id,
                    'title' => $gymClass->title,
                    'upcoming_slots' => $upcomingSlots->count(),
                    'confirmed' => $confirmed,
                    'waitlisted' => $waitlisted,
                ];
            });

        return Inertia::render('schedule/index', [
            'timeSlots' => $timeSlots,
            'coachSummary' => $coachSummary,
        ]);
    }
}
