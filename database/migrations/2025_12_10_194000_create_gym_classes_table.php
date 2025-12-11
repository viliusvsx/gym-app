<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends \Illuminate\Database\Migrations\Migration
{
    public function up(): void
    {
        Schema::create('gym_classes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('coach_id')->constrained('users');
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('default_capacity')->default(10);
            $table->boolean('waitlist_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gym_classes');
    }
};
