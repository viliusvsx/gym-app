<?php

namespace App\Http\Controllers\Habits;

use App\Enums\HabitLogStatus;
use App\Enums\HabitStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Habits\StoreHabitRequest;
use App\Models\Habit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HabitController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $habits = $user->habits()
            ->with(['logs' => fn ($query) => $query->orderByDesc('logged_for')])
            ->orderBy('name')
            ->get();

        $habitData = $habits->map(function (Habit $habit) {
            $logs = $habit->logs->sortByDesc('logged_for');
            [$currentStreak, $longestStreak] = $this->streaksForLogs($logs);

            $recentLogs = $logs
                ->take(21)
                ->values()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'logged_for' => $log->logged_for?->toDateString(),
                    'status' => $log->status?->value,
                    'notes' => $log->notes,
                ]);

            $completedCount = $logs->where('status', HabitLogStatus::Completed)->count();
            $completionRate = $logs->count() > 0
                ? round(($completedCount / $logs->count()) * 100)
                : null;

            return [
                'id' => $habit->id,
                'name' => $habit->name,
                'description' => $habit->description,
                'status' => $habit->status?->value,
                'target_per_week' => $habit->target_per_week,
                'reminder_time' => $this->formatReminderTime($habit->reminder_time),
                'reminder_enabled' => $habit->reminder_enabled,
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'recent_logs' => $recentLogs,
                'completion_rate' => $completionRate,
            ];
        });

        $streakSummary = [
            'longest' => $habitData->sortByDesc('longest_streak')->first(),
            'current' => $habitData->sortByDesc('current_streak')->first(),
        ];

        return Inertia::render('habits/index', [
            'habits' => $habitData,
            'streakSummary' => $streakSummary,
            'today' => now()->toDateString(),
            'statuses' => collect(HabitStatus::cases())->map(fn ($status) => [
                'name' => ucfirst(strtolower($status->name)),
                'value' => $status->value,
            ]),
            'logStatuses' => collect(HabitLogStatus::cases())->map(fn ($status) => [
                'name' => ucfirst(strtolower($status->name)),
                'value' => $status->value,
            ]),
        ]);
    }

    public function store(StoreHabitRequest $request): RedirectResponse
    {
        Gate::authorize('create', Habit::class);

        $data = $request->validated();
        $user = $request->user();

        $user->habits()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
            'target_per_week' => $data['target_per_week'],
            'reminder_time' => $data['reminder_time'] ?? null,
            'reminder_enabled' => $data['reminder_enabled'] ?? false,
        ]);

        return back()->with('status', 'Habit saved.');
    }

    private function streaksForLogs(Collection $logs): array
    {
        $currentStreak = 0;
        $longestStreak = 0;
        $expectedDate = now()->toDateString();

        foreach ($logs as $log) {
            $loggedFor = $log->logged_for?->toDateString();

            if ($log->status === HabitLogStatus::Completed && $loggedFor === $expectedDate) {
                $currentStreak++;
                $expectedDate = Carbon::parse($expectedDate)->subDay()->toDateString();
            } elseif ($loggedFor < $expectedDate) {
                break;
            }
        }

        $previousDate = null;
        $sequence = 0;

        foreach ($logs as $log) {
            if ($log->status !== HabitLogStatus::Completed) {
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

    private function formatReminderTime(?string $time): ?string
    {
        if (! $time) {
            return null;
        }

        return substr($time, 0, 5);
    }
}
