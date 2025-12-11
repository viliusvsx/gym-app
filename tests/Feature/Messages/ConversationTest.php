<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows only conversations for participants', function () {
    $alice = User::factory()->create();
    $bob = User::factory()->create();

    $conversation = Conversation::factory()->create();
    $conversation->participants()->attach([$alice->id, $bob->id]);

    $otherConversation = Conversation::factory()->create();
    $otherConversation->participants()->attach($bob->id);

    $response = $this->actingAs($alice)->get(route('messages.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('messages/index')
        ->has('conversations', 1)
        ->where('conversations.0.id', $conversation->id)
    );
});

it('prevents non-participants from viewing a conversation', function () {
    $alice = User::factory()->create();
    $bob = User::factory()->create();

    $conversation = Conversation::factory()->create();
    $conversation->participants()->attach($bob->id);

    $this->actingAs($alice)
        ->get(route('messages.show', $conversation))
        ->assertForbidden();
});

it('allows participants to post and read messages', function () {
    $alice = User::factory()->create();
    $bob = User::factory()->create();

    $conversation = Conversation::factory()->create();
    $conversation->participants()->attach([$alice->id, $bob->id]);

    $existingMessage = Message::factory()
        ->for($conversation)
        ->for($bob)
        ->create(['body' => 'Welcome to the thread']);

    $this->actingAs($alice)
        ->post(route('messages.store', $conversation), [
            'body' => 'Thanks, excited to join!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'user_id' => $alice->id,
        'body' => 'Thanks, excited to join!',
    ]);

    $this->actingAs($alice)
        ->get(route('messages.show', $conversation))
        ->assertInertia(fn (Assert $page) => $page
            ->component('messages/show')
            ->has('messages', 2)
            ->where('messages.0.body', $existingMessage->body)
        );

    $lastRead = $conversation
        ->participants()
        ->whereKey($alice->id)
        ->first()?->pivot
        ->last_read_at;

    expect($lastRead)->not->toBeNull();
});
