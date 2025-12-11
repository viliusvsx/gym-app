<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class HabitReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param Collection<int, \App\Models\Habit> $habits
     */
    public function __construct(private Collection $habits)
    {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage())
            ->subject('Habit reminders')
            ->greeting('Keep your streak alive!')
            ->line('You have habits waiting to be logged today:');

        foreach ($this->habits as $habit) {
            $message->line('• '.$habit->name);
        }

        return $message->action('Log habits', url(route('habits.index')));
    }
}
