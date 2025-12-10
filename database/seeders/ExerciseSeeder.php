<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exercises = [
            [
                'name' => 'Back Squat',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Quads', 'Glutes', 'Core'],
            ],
            [
                'name' => 'Front Squat',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Quads', 'Glutes', 'Core'],
            ],
            [
                'name' => 'Bench Press',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Chest', 'Triceps', 'Shoulders'],
            ],
            [
                'name' => 'Incline Bench Press',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Chest', 'Shoulders', 'Triceps'],
            ],
            [
                'name' => 'Overhead Press',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Shoulders', 'Triceps'],
            ],
            [
                'name' => 'Deadlift',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Hamstrings', 'Glutes', 'Back'],
            ],
            [
                'name' => 'Romanian Deadlift',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Hamstrings', 'Glutes'],
            ],
            [
                'name' => 'Barbell Row',
                'category' => 'Strength',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Back', 'Lats', 'Biceps'],
            ],
            [
                'name' => 'Pull-Up',
                'category' => 'Strength',
                'equipment' => 'Bodyweight',
                'primary_muscles' => ['Lats', 'Biceps', 'Back'],
            ],
            [
                'name' => 'Dumbbell Row',
                'category' => 'Accessory',
                'equipment' => 'Dumbbell',
                'primary_muscles' => ['Back', 'Lats', 'Biceps'],
            ],
            [
                'name' => 'Bulgarian Split Squat',
                'category' => 'Accessory',
                'equipment' => 'Dumbbell',
                'primary_muscles' => ['Quads', 'Glutes'],
            ],
            [
                'name' => 'Hip Thrust',
                'category' => 'Accessory',
                'equipment' => 'Barbell',
                'primary_muscles' => ['Glutes', 'Hamstrings'],
            ],
            [
                'name' => 'Lat Pulldown',
                'category' => 'Accessory',
                'equipment' => 'Machine',
                'primary_muscles' => ['Lats', 'Back', 'Biceps'],
            ],
            [
                'name' => 'Chest Supported Row',
                'category' => 'Accessory',
                'equipment' => 'Machine',
                'primary_muscles' => ['Back', 'Lats', 'Biceps'],
            ],
            [
                'name' => 'Dumbbell Curl',
                'category' => 'Accessory',
                'equipment' => 'Dumbbell',
                'primary_muscles' => ['Biceps', 'Forearms'],
            ],
            [
                'name' => 'Tricep Dip',
                'category' => 'Accessory',
                'equipment' => 'Bodyweight',
                'primary_muscles' => ['Triceps', 'Chest', 'Shoulders'],
            ],
            [
                'name' => 'Lunge',
                'category' => 'Accessory',
                'equipment' => 'Dumbbell',
                'primary_muscles' => ['Quads', 'Glutes', 'Hamstrings'],
            ],
            [
                'name' => 'Plank',
                'category' => 'Core',
                'equipment' => 'Bodyweight',
                'primary_muscles' => ['Core'],
            ],
            [
                'name' => 'Leg Press',
                'category' => 'Accessory',
                'equipment' => 'Machine',
                'primary_muscles' => ['Quads', 'Glutes'],
            ],
            [
                'name' => 'Seated Cable Row',
                'category' => 'Accessory',
                'equipment' => 'Cable',
                'primary_muscles' => ['Back', 'Lats', 'Biceps'],
            ],
        ];

        collect($exercises)->each(function (array $exercise): void {
            Exercise::firstOrCreate(
                [
                    'user_id' => null,
                    'name' => $exercise['name'],
                ],
                [
                    ...$exercise,
                    'user_id' => null,
                    'is_custom' => false,
                ]
            );
        });
    }
}
