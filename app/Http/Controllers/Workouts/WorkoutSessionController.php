<?php

namespace App\Http\Controllers\Workouts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workouts\StoreWorkoutSessionRequest;
use App\Models\Exercise;
use App\Models\WorkoutSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkoutSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $sessions = $user->sessions()
            ->with(['sets.exercise'])
            ->latest('performed_at')
            ->limit(10)
            ->get()
            ->map(function (WorkoutSession $session) {
                $volume = $session->sets->sum(function ($set) {
                    if (! $set->weight_kg || ! $set->reps) {
                        return 0;
                    }

                    return $set->weight_kg * $set->reps;
                });

                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'performed_at' => $session->performed_at?->toIso8601String(),
                    'notes' => $session->notes,
                    'volume' => round($volume, 2),
                    'sets' => $session->sets->map(function ($set) {
                        return [
                            'id' => $set->id,
                            'exercise' => $set->exercise?->name,
                            'reps' => $set->reps,
                            'weight_kg' => $set->weight_kg,
                            'rpe' => $set->rpe,
                            'is_warmup' => $set->is_warmup,
                        ];
                    }),
                ];
            });

        $exercises = Exercise::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->orderBy('is_custom')
            ->orderBy('name')
            ->get(['id', 'name', 'category', 'equipment', 'primary_muscles', 'is_custom']);

        $programs = $user->programs()
            ->with('blocks:id,program_id,title,sequence,week_count,is_deload')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('workouts/index', [
            'sessions' => $sessions,
            'exercises' => $exercises,
            'programs' => $programs,
            'unitSystem' => 'metric',
        ]);
    }

    public function store(StoreWorkoutSessionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $programId = $data['program_id'] ?? null;
        $blockId = $data['program_block_id'] ?? null;

        if ($programId && ! $user->programs()->whereKey($programId)->exists()) {
            $programId = null;
            $blockId = null;
        }

        if ($blockId && ! $user->blocks()->whereKey($blockId)->exists()) {
            $blockId = null;
        }

        DB::transaction(function () use ($data, $user, $programId, $blockId): void {
            $session = $user->sessions()->create([
                'name' => $data['name'],
                'performed_at' => $data['performed_at'],
                'duration_seconds' => $data['duration_seconds'] ?? null,
                'notes' => $data['notes'] ?? null,
                'program_id' => $programId ?? null,
                'program_block_id' => $blockId ?? null,
            ]);

            $supersets = [];

            foreach ($data['sets'] as $set) {
                $supersetId = null;

                if (! empty($set['superset_label'])) {
                    $supersets[$set['superset_label']] ??= $session->supersets()->create([
                        'label' => $set['superset_label'],
                        'sequence' => count($supersets) + 1,
                    ])->id;

                    $supersetId = $supersets[$set['superset_label']];
                }

                $session->sets()->create([
                    'exercise_id' => $set['exercise_id'],
                    'superset_id' => $supersetId,
                    'sequence' => $set['sequence'],
                    'reps' => $set['reps'] ?? null,
                    'weight_kg' => $set['weight_kg'] ?? null,
                    'rpe' => $set['rpe'] ?? null,
                    'rir' => $set['rir'] ?? null,
                    'percentage_of_one_rm' => $set['percentage_of_one_rm'] ?? null,
                    'is_warmup' => $set['is_warmup'] ?? false,
                    'rest_seconds' => $set['rest_seconds'] ?? null,
                    'tempo' => $set['tempo'] ?? null,
                    'notes' => $set['notes'] ?? null,
                ]);
            }
        });

        return back()->with('status', 'Workout saved.');
    }
}
