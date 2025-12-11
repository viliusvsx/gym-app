<?php

namespace App\Http\Controllers\Messages;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with([
                'participants:id,name',
                'workoutSession:id,name,performed_at',
                'messages' => fn ($query) => $query->latest()->limit(1)->with('user:id,name'),
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Conversation $conversation) => $this->transformConversationSummary($conversation, $user));

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response|JsonResponse
    {
        $user = $request->user();

        $this->authorize('view', $conversation);

        $conversation->load(['participants:id,name', 'workoutSession:id,name,performed_at']);

        $messages = $conversation->messages()
            ->with('user:id,name')
            ->orderBy('created_at')
            ->get();

        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        $payload = [
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'workout_session' => $conversation->workoutSession ? [
                    'id' => $conversation->workoutSession->id,
                    'name' => $conversation->workoutSession->name,
                    'performed_at' => $conversation->workoutSession->performed_at?->toIso8601String(),
                ] : null,
            ],
            'participants' => $conversation->participants->map(fn (User $participant) => [
                'id' => $participant->id,
                'name' => $participant->name,
            ]),
            'messages' => $messages->map(fn (Message $message) => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => $message->created_at?->toIso8601String(),
                'user' => [
                    'id' => $message->user->id,
                    'name' => $message->user->name,
                ],
            ]),
            'currentUserId' => $user->id,
            'lastSyncedAt' => now()->toIso8601String(),
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('messages/show', $payload);
    }

    public function storeMessage(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();

        $this->authorize('sendMessage', $conversation);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $validated['body'],
        ]);

        $conversation->touch();

        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        return back()->with('success', 'Message sent.');
    }

    /**
     * @return array<string, mixed>
     */
    private function transformConversationSummary(Conversation $conversation, User $user): array
    {
        $lastReadAt = $conversation->pivot?->last_read_at;

        $lastMessage = $conversation->messages->first();

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'workout_session' => $conversation->workoutSession ? [
                'id' => $conversation->workoutSession->id,
                'name' => $conversation->workoutSession->name,
                'performed_at' => $conversation->workoutSession->performed_at?->toIso8601String(),
            ] : null,
            'participants' => $conversation->participants->map(fn (User $participant) => [
                'id' => $participant->id,
                'name' => $participant->name,
            ]),
            'last_message' => $lastMessage ? [
                'id' => $lastMessage->id,
                'body' => $lastMessage->body,
                'created_at' => $lastMessage->created_at?->toIso8601String(),
                'user' => [
                    'id' => $lastMessage->user->id,
                    'name' => $lastMessage->user->name,
                ],
            ] : null,
            'last_read_at' => $lastReadAt?->toIso8601String(),
            'unread_count' => $conversation->messages()
                ->when($lastReadAt, fn ($query) => $query->where('created_at', '>', $lastReadAt))
                ->count(),
            'updated_at' => $conversation->updated_at?->toIso8601String(),
            'currentUserId' => $user->id,
        ];
    }
}
