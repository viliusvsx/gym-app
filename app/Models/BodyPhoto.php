<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyPhoto extends Model
{
    /** @use HasFactory<\Database\Factories\BodyPhotoFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'body_metric_id',
        'path',
        'caption',
        'sequence',
        'taken_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'taken_at' => 'datetime',
        ];
    }

    public function metric(): BelongsTo
    {
        return $this->belongsTo(BodyMetric::class, 'body_metric_id');
    }
}
