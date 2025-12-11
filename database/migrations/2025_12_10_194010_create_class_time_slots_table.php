<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends \Illuminate\Database\Migrations\Migration
{
    public function up(): void
    {
        Schema::create('class_time_slots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('gym_class_id')->constrained('gym_classes')->cascadeOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->unsignedInteger('capacity')->nullable();
            $table->boolean('allow_waitlist')->default(true);
            $table->string('location')->nullable();
            $table->timestamps();

            $table->index(['starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_time_slots');
    }
};
