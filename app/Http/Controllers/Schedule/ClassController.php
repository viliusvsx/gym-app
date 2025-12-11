<?php

namespace App\Http\Controllers\Schedule;

use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreGymClassRequest;
use Illuminate\Http\RedirectResponse;

class ClassController extends Controller
{
    public function store(StoreGymClassRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $gymClass = $user->gymClasses()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'default_capacity' => $data['default_capacity'],
            'waitlist_enabled' => $data['waitlist_enabled'] ?? true,
        ]);

        foreach ($data['time_slots'] ?? [] as $slot) {
            $gymClass->timeSlots()->create([
                'starts_at' => $slot['starts_at'],
                'ends_at' => $slot['ends_at'],
                'capacity' => $slot['capacity'] ?? $gymClass->default_capacity,
                'allow_waitlist' => $slot['allow_waitlist'] ?? true,
                'location' => $slot['location'] ?? null,
            ]);
        }

        return back()->with('status', 'Class created successfully.');
    }
}
