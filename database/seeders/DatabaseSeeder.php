<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'vilius.vlasovas@kodinta.lt'],
            [
                'name' => 'Vilius Vlasovas',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            ExerciseSeeder::class,
        ]);

        $program = $user->programs()->updateOrCreate(
            ['name' => 'Base Strength'],
            [
                'description' => 'Four-week block focused on the big six in metric units.',
                'starts_on' => now()->startOfWeek(),
                'ends_on' => now()->addWeeks(4)->startOfWeek(),
                'is_active' => true,
            ]
        );

        $block = $program->blocks()->updateOrCreate(
            ['sequence' => 1],
            [
                'title' => 'Foundation',
                'week_count' => 4,
                'is_deload' => false,
                'focus' => 'Volume and consistent movement quality.',
            ]
        );

        $session = $user->sessions()->create([
            'program_id' => $program->id,
            'program_block_id' => $block->id,
            'name' => 'Full Body Primer',
            'performed_at' => now()->subDay(),
            'duration_seconds' => 3600,
            'notes' => 'Seeded session with core lifts in kilograms.',
        ]);

        $exercises = Exercise::whereNull('user_id')->take(3)->get();

        if ($exercises->isEmpty()) {
            $exercises = $user->exercises()->take(3)->get();
        }

        foreach ($exercises as $index => $exercise) {
            $session->sets()->create([
                'exercise_id' => $exercise->id,
                'sequence' => $index + 1,
                'reps' => 5 + $index,
                'weight_kg' => 60 + ($index * 10),
                'rpe' => 7.5,
                'percentage_of_one_rm' => 75,
                'is_warmup' => false,
                'rest_seconds' => 120,
                'tempo' => '31X1',
            ]);
        }

        $metric = $user->bodyMetrics()->updateOrCreate(
            ['recorded_at' => now()->toDateString()],
            [
                'weight_kg' => 82.4,
                'body_fat_percent' => 14.2,
                'waist_cm' => 82.5,
                'chest_cm' => 107,
                'hips_cm' => 99,
                'arm_cm' => 36.5,
                'thigh_cm' => 60,
                'notes' => 'Seeded metric entry in centimeters and kilograms.',
            ]
        );

        $photoPath = 'progress/demo-front.jpg';
        if (! Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->put($photoPath, '');
        }

        $metric->photos()->updateOrCreate(
            ['sequence' => 1],
            [
                'path' => $photoPath,
                'caption' => 'Front relaxed',
                'taken_at' => now(),
            ]
        );
    }
}
