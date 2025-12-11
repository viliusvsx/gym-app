<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutSession extends Model
{
    /** @use HasFactory<\Database\Factories\WorkoutSessionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'program_id',
        'program_block_id',
        'name',
        'performed_at',
        'duration_seconds',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function block(): BelongsTo
    {
        return $this->belongsTo(ProgramBlock::class, 'program_block_id');
    }

    public function sets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class)->orderBy('sequence');
    }

    public function supersets(): HasMany
    {
        return $this->hasMany(Superset::class)->orderBy('sequence');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
