<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutSet extends Model
{
    /** @use HasFactory<\Database\Factories\WorkoutSetFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'workout_session_id',
        'exercise_id',
        'superset_id',
        'sequence',
        'reps',
        'weight_kg',
        'rpe',
        'rir',
        'percentage_of_one_rm',
        'is_warmup',
        'rest_seconds',
        'tempo',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'reps' => 'integer',
            'weight_kg' => 'decimal:2',
            'rpe' => 'decimal:2',
            'rir' => 'decimal:2',
            'percentage_of_one_rm' => 'decimal:2',
            'is_warmup' => 'bool',
            'rest_seconds' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'workout_session_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function superset(): BelongsTo
    {
        return $this->belongsTo(Superset::class);
    }
}
