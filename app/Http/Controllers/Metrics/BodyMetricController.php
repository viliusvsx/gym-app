<?php

namespace App\Http\Controllers\Metrics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Metrics\StoreBodyMetricRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BodyMetricController extends Controller
{
    public function index(Request $request): Response
    {
        $metrics = $request->user()->bodyMetrics()
            ->with('photos')
            ->orderByDesc('recorded_at')
            ->limit(30)
            ->get()
            ->map(function ($metric) {
                return [
                    'id' => $metric->id,
                    'recorded_at' => $metric->recorded_at?->toDateString(),
                    'weight_kg' => $metric->weight_kg,
                    'body_fat_percent' => $metric->body_fat_percent,
                    'waist_cm' => $metric->waist_cm,
                    'chest_cm' => $metric->chest_cm,
                    'hips_cm' => $metric->hips_cm,
                    'arm_cm' => $metric->arm_cm,
                    'thigh_cm' => $metric->thigh_cm,
                    'notes' => $metric->notes,
                    'photos' => $metric->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'caption' => $photo->caption,
                            'url' => Storage::disk('public')->url($photo->path),
                        ];
                    }),
                ];
            });

        $weightTrend = $metrics
            ->sortBy('recorded_at')
            ->map(fn ($metric) => [
                'date' => $metric['recorded_at'],
                'weight_kg' => $metric['weight_kg'],
            ])
            ->values();

        return Inertia::render('metrics/index', [
            'metrics' => $metrics,
            'weightTrend' => $weightTrend,
            'unitSystem' => 'metric',
        ]);
    }

    public function store(StoreBodyMetricRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $metric = $request->user()->bodyMetrics()->updateOrCreate(
            ['recorded_at' => $data['recorded_at']],
            [
                'weight_kg' => $data['weight_kg'] ?? null,
                'body_fat_percent' => $data['body_fat_percent'] ?? null,
                'waist_cm' => $data['waist_cm'] ?? null,
                'chest_cm' => $data['chest_cm'] ?? null,
                'hips_cm' => $data['hips_cm'] ?? null,
                'arm_cm' => $data['arm_cm'] ?? null,
                'thigh_cm' => $data['thigh_cm'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]
        );

        if (! empty($data['photos'])) {
            $sequence = (int) $metric->photos()->max('sequence');

            foreach ($data['photos'] as $photo) {
                $sequence++;

                $path = $photo->store('progress', 'public');

                $metric->photos()->create([
                    'path' => $path,
                    'caption' => $photo->getClientOriginalName(),
                    'sequence' => $sequence,
                    'taken_at' => now(),
                ]);
            }
        }

        return back()->with('status', 'Metrics saved.');
    }
}
