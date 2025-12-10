<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BodyMetric extends Model
{
    /** @use HasFactory<\Database\Factories\BodyMetricFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'recorded_at',
        'weight_kg',
        'body_fat_percent',
        'waist_cm',
        'chest_cm',
        'hips_cm',
        'arm_cm',
        'thigh_cm',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'date',
            'weight_kg' => 'decimal:2',
            'body_fat_percent' => 'decimal:2',
            'waist_cm' => 'decimal:2',
            'chest_cm' => 'decimal:2',
            'hips_cm' => 'decimal:2',
            'arm_cm' => 'decimal:2',
            'thigh_cm' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(BodyPhoto::class);
    }
}
