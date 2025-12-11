import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { index as messagesIndex } from '@/routes/messages';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { MessageSquare, Send, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Participant = {
    id: number;
    name: string;
};

type Message = {
    id: number;
    body: string;
    created_at?: string | null;
    user: Participant;
};

type WorkoutSessionSummary = {
    id: number;
    name: string;
    performed_at?: string | null;
} | null;

type ConversationPayload = {
    conversation: {
        id: number;
        title: string;
        workout_session: WorkoutSessionSummary;
    };
    participants: Participant[];
    messages: Message[];
    currentUserId: number;
    lastSyncedAt?: string;
};

const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '';

export default function ConversationShow({
    conversation,
    participants,
    messages,
    currentUserId,
    lastSyncedAt,
}: ConversationPayload) {
    const [isSyncing, setIsSyncing] = useState(false);
    const messageListRef = useRef<HTMLDivElement | null>(null);
    const form = useForm({ body: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Messages',
            href: messagesIndex().url ?? messagesIndex(),
        },
        {
            title: conversation.title,
            href: '',
        },
    ];

    const scrollToBottom = useCallback(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const syncMessages = useCallback(() => {
        setIsSyncing(true);
        router.reload({
            only: ['messages', 'lastSyncedAt'],
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSyncing(false),
        });
    }, []);

    useEffect(() => {
        const interval = window.setInterval(syncMessages, 5000);
        return () => window.clearInterval(interval);
    }, [syncMessages]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/messages/${conversation.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                scrollToBottom();
            },
        });
    };

    const lastUpdatedLabel = useMemo(() => {
        if (!lastSyncedAt) {
            return 'Not synced yet';
        }

        return `Last updated ${new Date(lastSyncedAt).toLocaleTimeString()}`;
    }, [lastSyncedAt]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={conversation.title} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {conversation.title}
                            </h1>
                            {conversation.workout_session && (
                                <p className="text-sm text-muted-foreground">
                                    Linked to {conversation.workout_session.name}
                                    {conversation.workout_session.performed_at
                                        ? ` • ${formatDateTime(conversation.workout_session.performed_at)}`
                                        : ''}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {isSyncing && <Spinner className="h-4 w-4" />}
                            <span>{lastUpdatedLabel}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {participants.map((participant) => (
                            <Badge key={participant.id} variant="outline">
                                {participant.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Card className="flex flex-1 flex-col overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            Thread activity
                        </div>
                        <Link
                            className="text-sm text-primary hover:underline"
                            href={messagesIndex().url ?? messagesIndex()}
                        >
                            Back to threads
                        </Link>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex flex-1 flex-col gap-4 p-4">
                        <div
                            ref={messageListRef}
                            className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-md border bg-muted/30 p-3"
                            role="log"
                            aria-live="polite"
                        >
                            {messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No messages yet. Start the conversation below.
                                </p>
                            ) : (
                                messages.map((message) => {
                                    const isMine = message.user.id === currentUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xl rounded-lg border bg-card p-3 shadow-sm ${
                                                    isMine ? 'border-primary/40 bg-primary/5' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground">
                                                        {message.user.name}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(message.created_at)}</span>
                                                </div>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                                                    {message.body}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2" aria-label="Send a message">
                            <label className="text-sm font-medium text-foreground" htmlFor="body">
                                Reply
                            </label>
                            <textarea
                                id="body"
                                name="body"
                                className="h-24 w-full resize-none rounded-md border bg-background p-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                placeholder="Type your message..."
                                value={form.data.body}
                                onChange={(event) => form.setData('body', event.target.value)}
                                required
                            />
                            <InputError message={form.errors.body} />
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">
                                    Press Tab then Enter to send quickly with the keyboard.
                                </p>
                                <Button type="submit" disabled={form.processing || form.data.body.trim().length === 0}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Sending...' : 'Send message'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
