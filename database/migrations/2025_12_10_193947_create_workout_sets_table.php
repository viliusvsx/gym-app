<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workout_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->foreignId('superset_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sequence')->default(1);
            $table->unsignedInteger('reps')->nullable();
            $table->decimal('weight_kg', 7, 2)->nullable();
            $table->decimal('rpe', 4, 2)->nullable();
            $table->decimal('rir', 4, 2)->nullable();
            $table->decimal('percentage_of_one_rm', 5, 2)->nullable();
            $table->boolean('is_warmup')->default(false);
            $table->unsignedInteger('rest_seconds')->nullable();
            $table->string('tempo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_sets');
    }
};
