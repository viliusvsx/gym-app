<?php

namespace App\Http\Controllers;

use App\Enums\HabitLogStatus;
use App\Models\WorkoutSession;
use App\Models\WorkoutSet;
use App\Models\Habit;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
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

        $habitStreaks = $user->habits()
            ->with(['logs' => fn ($query) => $query->orderByDesc('logged_for')->limit(30)])
            ->orderBy('name')
            ->get()
            ->map(function (Habit $habit) {
                [$currentStreak, $longestStreak] = $this->streaksForLogs($habit->logs);

                return [
                    'id' => $habit->id,
                    'name' => $habit->name,
                    'status' => $habit->status?->value,
                    'current_streak' => $currentStreak,
                    'longest_streak' => $longestStreak,
                ];
            })
            ->sortByDesc('current_streak')
            ->values();

        return Inertia::render('dashboard', [
            'bestLifts' => $bestLifts,
            'volumeByDay' => $volumeByDay,
            'bodyWeights' => $bodyWeights,
            'sessionHighlights' => $sessionHighlights,
            'unitSystem' => 'metric',
            'habitStreaks' => $habitStreaks,
        ]);
    }

    private function estimateOneRepMax(?float $weight, ?int $reps): float
    {
        if (! $weight || ! $reps) {
            return 0;
        }

        return $weight * (1 + ($reps / 30));
    }

    private function streaksForLogs(Collection $logs): array
    {
        $currentStreak = 0;
        $longestStreak = 0;
        $expectedDate = now()->toDateString();

        foreach ($logs as $log) {
            $loggedFor = $log->logged_for?->toDateString();

            $status = is_string($log->status) ? $log->status : $log->status?->value;

            if ($status === HabitLogStatus::Completed->value && $loggedFor === $expectedDate) {
                $currentStreak++;
                $expectedDate = Carbon::parse($expectedDate)->subDay()->toDateString();
            } elseif ($loggedFor < $expectedDate) {
                break;
            }
        }

        $previousDate = null;
        $sequence = 0;

        foreach ($logs as $log) {
            $status = is_string($log->status) ? $log->status : $log->status?->value;

            if ($status !== HabitLogStatus::Completed->value) {
                $sequence = 0;
                $previousDate = null;
                continue;
            }

            $loggedFor = $log->logged_for?->toDateString();

            if ($previousDate && $loggedFor === Carbon::parse($previousDate)->subDay()->toDateString()) {
                $sequence++;
            } else {
                $sequence = 1;
            }

            $previousDate = $loggedFor;
            $longestStreak = max($longestStreak, $sequence);
        }

        return [$currentStreak, $longestStreak];
    }
}
