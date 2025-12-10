<?php

namespace App\Http\Controllers;

use App\Models\WorkoutSession;
use App\Models\WorkoutSet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $recentSessions = $user->sessions()
            ->with(['sets.exercise'])
            ->latest('performed_at')
            ->limit(5)
            ->get();

        $sets = WorkoutSet::query()
            ->with('exercise')
            ->whereHas('session', fn ($query) => $query->where('user_id', $user->id))
            ->whereHas('session', fn ($query) => $query->whereNotNull('performed_at'))
            ->where('weight_kg', '>', 0)
            ->where('reps', '>', 0)
            ->get();

        $bestLifts = $sets
            ->groupBy('exercise_id')
            ->map(function ($exerciseSets) {
                $topSet = $exerciseSets->sortByDesc(function ($set) {
                    return $this->estimateOneRepMax($set->weight_kg, $set->reps);
                })->first();

                if (! $topSet) {
                    return null;
                }

                return [
                    'exercise' => $topSet->exercise?->name,
                    'weight_kg' => $topSet->weight_kg,
                    'reps' => $topSet->reps,
                    'estimated_one_rm' => round($this->estimateOneRepMax($topSet->weight_kg, $topSet->reps), 2),
                ];
            })
            ->filter()
            ->values()
            ->sortByDesc(fn ($set) => $set['estimated_one_rm'])
            ->take(5)
            ->values();

        $volumeByDay = WorkoutSet::query()
            ->selectRaw('DATE(workout_sessions.performed_at) as day')
            ->selectRaw('SUM(COALESCE(weight_kg,0) * COALESCE(reps,0)) as volume')
            ->join('workout_sessions', 'workout_sessions.id', '=', 'workout_sets.workout_session_id')
            ->where('workout_sessions.user_id', $user->id)
            ->where('workout_sessions.performed_at', '>=', now()->subWeeks(8))
            ->groupByRaw('DATE(workout_sessions.performed_at)')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'volume' => round((float) $row->volume, 2),
            ]);

        $bodyWeights = $user->bodyMetrics()
            ->orderBy('recorded_at')
            ->get(['recorded_at', 'weight_kg'])
            ->map(fn ($metric) => [
                'date' => $metric->recorded_at?->toDateString(),
                'weight_kg' => $metric->weight_kg,
            ]);

        $sessionHighlights = $recentSessions->map(function (WorkoutSession $session) {
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
                'volume' => round($volume, 2),
                'sets' => $session->sets->count(),
            ];
        });

        return Inertia::render('dashboard', [
            'bestLifts' => $bestLifts,
            'volumeByDay' => $volumeByDay,
            'bodyWeights' => $bodyWeights,
            'sessionHighlights' => $sessionHighlights,
            'unitSystem' => 'metric',
        ]);
    }

    private function estimateOneRepMax(?float $weight, ?int $reps): float
    {
        if (! $weight || ! $reps) {
            return 0;
        }

        return $weight * (1 + ($reps / 30));
    }
}
