<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GymClass extends Model
{
    /** @use HasFactory<\Database\Factories\GymClassFactory> */
    use HasFactory;

    protected $fillable = [
        'coach_id',
        'title',
        'description',
        'default_capacity',
        'waitlist_enabled',
    ];

    protected $casts = [
        'waitlist_enabled' => 'boolean',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(ClassTimeSlot::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(ClassReservation::class);
    }
}
