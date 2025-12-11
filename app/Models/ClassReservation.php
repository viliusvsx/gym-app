<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassReservation extends Model
{
    /** @use HasFactory<\Database\Factories\ClassReservationFactory> */
    use HasFactory;

    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_WAITLISTED = 'waitlisted';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'class_time_slot_id',
        'user_id',
        'status',
    ];

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(ClassTimeSlot::class, 'class_time_slot_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
