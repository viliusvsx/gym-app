<?php

namespace App\Http\Controllers\Exercises;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exercises\StoreExerciseRequest;
use App\Models\Exercise;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExerciseController extends Controller
{
    public function index(Request $request): Response
    {
        $exercises = Exercise::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $request->user()->id)
            ->orderBy('is_custom')
            ->orderBy('name')
            ->get()
            ->groupBy(fn (Exercise $exercise) => $exercise->category ?? 'Uncategorized')
            ->map(
                fn ($group) => $group->map(
                    fn (Exercise $exercise) => [
                        'id' => $exercise->id,
                        'name' => $exercise->name,
                        'category' => $exercise->category,
                        'equipment' => $exercise->equipment,
                        'primary_muscles' => $exercise->primary_muscles,
                        'is_custom' => $exercise->is_custom,
                        'notes' => $exercise->notes,
                    ]
                )->values()
            );

        return Inertia::render('exercises/index', [
            'exercisesByCategory' => $exercises,
            'unitSystem' => 'metric',
        ]);
    }

    public function store(StoreExerciseRequest $request): RedirectResponse
    {
        Exercise::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'is_custom' => true,
        ]);

        return back()->with('status', 'Exercise added.');
    }
}
