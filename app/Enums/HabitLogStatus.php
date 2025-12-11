<?php

namespace App\Enums;

enum HabitLogStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Skipped = 'skipped';
}
