<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Http\Requests\Programs\StoreProgramRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $programs = $request->user()->programs()
            ->with([
                'blocks' => fn ($query) => $query->orderBy('sequence'),
                'sessions:id,program_id,performed_at',
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'starts_on' => $program->starts_on?->toDateString(),
                    'ends_on' => $program->ends_on?->toDateString(),
                    'is_active' => $program->is_active,
                    'blocks' => $program->blocks->map(function ($block) {
                        return [
                            'id' => $block->id,
                            'title' => $block->title,
                            'sequence' => $block->sequence,
                            'week_count' => $block->week_count,
                            'is_deload' => $block->is_deload,
                            'focus' => $block->focus,
                        ];
                    }),
                    'session_count' => $program->sessions->count(),
                ];
            });

        return Inertia::render('programs/index', [
            'programs' => $programs,
        ]);
    }

    public function store(StoreProgramRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $program = $request->user()->programs()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'starts_on' => $data['starts_on'] ?? null,
            'ends_on' => $data['ends_on'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $blocks = $data['blocks'] ?? [
            [
                'title' => 'Block 1',
                'week_count' => 4,
                'is_deload' => false,
                'sequence' => 1,
                'focus' => 'General strength',
            ],
        ];

        foreach ($blocks as $index => $block) {
            $program->blocks()->create([
                'title' => $block['title'],
                'week_count' => $block['week_count'] ?? 4,
                'is_deload' => $block['is_deload'] ?? false,
                'sequence' => $block['sequence'] ?? ($index + 1),
                'focus' => $block['focus'] ?? null,
            ]);
        }

        return back()->with('status', 'Program saved.');
    }
}
