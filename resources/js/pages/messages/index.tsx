import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { index as messagesIndex, show as messagesShow } from '@/routes/messages';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Messages',
        href: messagesIndex().url ?? messagesIndex(),
    },
];

type Participant = {
    id: number;
    name: string;
};

type MessageSummary = {
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

type ConversationSummary = {
    id: number;
    title: string;
    workout_session: WorkoutSessionSummary;
    participants: Participant[];
    last_message: MessageSummary | null;
    unread_count: number;
    updated_at?: string | null;
};

export default function MessagesIndex({
    conversations,
}: {
    conversations: ConversationSummary[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
                        <p className="text-sm text-muted-foreground">
                            Chat with your training partners and review workout-related threads.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {conversations.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare className="h-5 w-5" />
                                    No conversations yet
                                </CardTitle>
                                <CardDescription>
                                    Start logging workouts with teammates to begin a new thread.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        conversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={messagesShow({ conversation: conversation.id })}
                                className="block"
                            >
                                <Card className="transition hover:border-primary">
                                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {conversation.title}
                                            </CardTitle>
                                            {conversation.workout_session && (
                                                <CardDescription>
                                                    Linked to {conversation.workout_session.name}{' '}
                                                    {conversation.workout_session.performed_at
                                                        ? `on ${new Date(
                                                                conversation.workout_session.performed_at,
                                                            ).toLocaleDateString()}`
                                                        : ''}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {conversation.unread_count > 0 && (
                                                <Badge variant="secondary">
                                                    {conversation.unread_count} unread
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {conversation.participants.length}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            {conversation.last_message ? (
                                                <span className="line-clamp-1">
                                                    {conversation.last_message.user.name}: {conversation.last_message.body}
                                                </span>
                                            ) : (
                                                <span>No messages yet</span>
                                            )}
                                        </div>
                                        <Separator />
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            {conversation.participants.map((participant) => (
                                                <Badge key={participant.id} variant="outline">
                                                    {participant.name}
                                                </Badge>
                                            ))}
                                            {conversation.updated_at && (
                                                <span>
                                                    Updated {new Date(conversation.updated_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
