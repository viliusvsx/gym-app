<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends \Illuminate\Database\Migrations\Migration
{
    public function up(): void
    {
        Schema::create('class_reservations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('class_time_slot_id')->constrained('class_time_slots')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('confirmed');
            $table->timestamps();

            $table->unique(['class_time_slot_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_reservations');
    }
};
