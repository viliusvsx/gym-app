<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Exercises\ExerciseController;
use App\Http\Controllers\Habits\HabitController;
use App\Http\Controllers\Habits\HabitLogController;
use App\Http\Controllers\Metrics\BodyMetricController;
use App\Http\Controllers\Programs\ProgramController;
use App\Http\Controllers\Workouts\WorkoutSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('workouts', [WorkoutSessionController::class, 'index'])->name('workouts.index');
    Route::post('workouts', [WorkoutSessionController::class, 'store'])->name('workouts.store');

    Route::get('exercises', [ExerciseController::class, 'index'])->name('exercises.index');
    Route::post('exercises', [ExerciseController::class, 'store'])->name('exercises.store');

    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');
    Route::post('programs', [ProgramController::class, 'store'])->name('programs.store');

    Route::get('metrics', [BodyMetricController::class, 'index'])->name('metrics.index');
    Route::post('metrics', [BodyMetricController::class, 'store'])->name('metrics.store');

    Route::get('habits', [HabitController::class, 'index'])->name('habits.index');
    Route::post('habits', [HabitController::class, 'store'])->name('habits.store');
    Route::post('habits/{habit}/logs', [HabitLogController::class, 'store'])->name('habits.logs.store');
});

require __DIR__.'/settings.php';
