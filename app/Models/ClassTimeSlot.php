<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class ClassTimeSlot extends Model
{
    /** @use HasFactory<\Database\Factories\ClassTimeSlotFactory> */
    use HasFactory;

    protected $fillable = [
        'gym_class_id',
        'starts_at',
        'ends_at',
        'capacity',
        'allow_waitlist',
        'location',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'allow_waitlist' => 'boolean',
    ];

    public function gymClass(): BelongsTo
    {
        return $this->belongsTo(GymClass::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(ClassReservation::class);
    }

    public function attendees(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, ClassReservation::class, 'class_time_slot_id', 'id', 'id', 'user_id');
    }

    public function confirmedReservationsCount(): int
    {
        return $this->reservations()->where('status', ClassReservation::STATUS_CONFIRMED)->count();
    }

    public function remainingCapacity(): ?int
    {
        if ($this->capacity === null) {
            return null;
        }

        return max($this->capacity - $this->reservations()->where('status', ClassReservation::STATUS_CONFIRMED)->count(), 0);
    }
}
