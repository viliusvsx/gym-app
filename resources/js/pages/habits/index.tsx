import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import HabitController from '@/actions/App/Http/Controllers/Habits/HabitController';
import HabitLogController from '@/actions/App/Http/Controllers/Habits/HabitLogController';
import AppLayout from '@/layouts/app-layout';
import { index as habitsIndex } from '@/routes/habits';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlarmClock,
    CheckCircle2,
    Flame,
    Sparkles,
    Target,
} from 'lucide-react';
import React from 'react';

interface HabitLog {
    id: number;
    logged_for: string;
    status: string;
    notes?: string | null;
}

interface HabitResource {
    id: number;
    name: string;
    description?: string | null;
    status?: string | null;
    target_per_week: number;
    reminder_time?: string | null;
    reminder_enabled: boolean;
    current_streak: number;
    longest_streak: number;
    recent_logs: HabitLog[];
    completion_rate?: number | null;
}

interface HabitsPageProps {
    habits: HabitResource[];
    streakSummary: {
        longest?: HabitResource | null;
        current?: HabitResource | null;
    };
    today: string;
    statuses: { name: string; value: string }[];
    logStatuses: { name: string; value: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Habits',
        href: habitsIndex().url,
    },
];

export default function Habits({
    habits,
    streakSummary,
    today,
    statuses,
    logStatuses,
}: HabitsPageProps) {
    const createForm = useForm({
        name: '',
        description: '',
        status: statuses?.[0]?.value ?? 'active',
        target_per_week: 5,
        reminder_time: '07:00',
        reminder_enabled: true,
    });

    const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post(HabitController.store().url, {
            preserveScroll: true,
            onSuccess: () => createForm.reset('name', 'description'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Habits" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">Track habits</CardTitle>
                                <CardDescription>
                                    Capture daily repetitions, keep streaks alive, and log how your routines are going.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-2 bg-primary/10 text-primary">
                                <Flame className="h-4 w-4" />
                                {habits.length} habits
                            </Badge>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <StreakTile
                                title="Current leader"
                                description="Longest active streak right now"
                                value={
                                    streakSummary.current
                                        ? `${streakSummary.current.current_streak} days`
                                        : 'No streak yet'
                                }
                                hint={streakSummary.current?.name}
                            />
                            <StreakTile
                                title="All-time best"
                                description="Your longest streak"
                                value={
                                    streakSummary.longest
                                        ? `${streakSummary.longest.longest_streak} days`
                                        : 'Keep logging to build momentum'
                                }
                                hint={streakSummary.longest?.name}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background">
                        <CardHeader>
                            <CardTitle>Add a habit</CardTitle>
                            <CardDescription>Keep it short and actionable.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(event) =>
                                            createForm.setData('name', event.target.value)
                                        }
                                        placeholder="Daily walk"
                                        required
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={createForm.data.description}
                                        onChange={(event) =>
                                            createForm.setData('description', event.target.value)
                                        }
                                        placeholder="15 minute loop around the block"
                                    />
                                    <InputError message={createForm.errors.description} />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={createForm.data.status}
                                            onValueChange={(value) => createForm.setData('status', value)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Active" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={createForm.errors.status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="target_per_week">Target / week</Label>
                                        <Input
                                            id="target_per_week"
                                            type="number"
                                            min={1}
                                            max={14}
                                            value={createForm.data.target_per_week}
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'target_per_week',
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <InputError message={createForm.errors.target_per_week} />
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="reminder_time">Reminder time</Label>
                                        <Input
                                            id="reminder_time"
                                            type="time"
                                            value={createForm.data.reminder_time ?? ''}
                                            onChange={(event) =>
                                                createForm.setData('reminder_time', event.target.value)
                                            }
                                        />
                                        <InputError message={createForm.errors.reminder_time} />
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                                        <Checkbox
                                            id="reminder_enabled"
                                            checked={createForm.data.reminder_enabled}
                                            onCheckedChange={(checked) =>
                                                createForm.setData('reminder_enabled', Boolean(checked))
                                            }
                                        />
                                        <Label htmlFor="reminder_enabled" className="text-sm">
                                            Send me a reminder
                                        </Label>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={createForm.processing}>
                                    {createForm.processing ? 'Saving...' : 'Save habit'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            today={today}
                            logStatuses={logStatuses}
                        />
                    ))}

                    {habits.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                                <Sparkles className="h-6 w-6" />
                                <p className="text-sm">
                                    Create your first habit to start building streaks and consistency.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

interface HabitCardProps {
    habit: HabitResource;
    today: string;
    logStatuses: { name: string; value: string }[];
}

function HabitCard({ habit, today, logStatuses }: HabitCardProps) {
    const logForm = useForm({
        logged_for: today,
        status: logStatuses[0]?.value ?? 'completed',
        notes: '',
    });

    const submitLog = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        logForm.post(HabitLogController.store(habit.id).url, {
            preserveScroll: true,
            onSuccess: () => logForm.reset('notes'),
        });
    };

    return (
        <Card className="flex h-full flex-col overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        {habit.name}
                    </CardTitle>
                    {habit.description && (
                        <CardDescription className="line-clamp-2 text-sm">
                            {habit.description}
                        </CardDescription>
                    )}
                </div>
                <Badge variant="secondary" className="capitalize">
                    {habit.status}
                </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <DetailTile
                        label="Current streak"
                        value={`${habit.current_streak}d`}
                        icon={Flame}
                    />
                    <DetailTile
                        label="Longest"
                        value={`${habit.longest_streak}d`}
                        icon={Target}
                    />
                    <DetailTile
                        label="Target/week"
                        value={`${habit.target_per_week}`}
                        icon={CheckCircle2}
                    />
                    <DetailTile
                        label="Reminder"
                        value={habit.reminder_enabled ? habit.reminder_time ?? 'Set time' : 'Off'}
                        icon={AlarmClock}
                    />
                </div>

                <form onSubmit={submitLog} className="space-y-3 rounded-lg border border-border/70 bg-muted/40 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Log date
                            </Label>
                            <Input
                                type="date"
                                value={logForm.data.logged_for}
                                onChange={(event) =>
                                    logForm.setData('logged_for', event.target.value)
                                }
                                className="bg-background"
                            />
                            <InputError message={logForm.errors.logged_for} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Status
                            </Label>
                            <Select
                                value={logForm.data.status}
                                onValueChange={(value) => logForm.setData('status', value)}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Completed" />
                                </SelectTrigger>
                                <SelectContent>
                                    {logStatuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={logForm.errors.status} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Notes (optional)
                        </Label>
                        <Input
                            value={logForm.data.notes ?? ''}
                            onChange={(event) => logForm.setData('notes', event.target.value)}
                            placeholder="How did it go?"
                            className="bg-background"
                        />
                        <InputError message={logForm.errors.notes} />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Completed
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Skipped
                            </div>
                        </div>
                        <Button type="submit" size="sm" disabled={logForm.processing}>
                            {logForm.processing ? 'Saving...' : 'Log today'}
                        </Button>
                    </div>
                </form>

                <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Recent days
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {habit.recent_logs.map((log) => (
                            <span
                                key={log.id}
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-colors ${
                                    log.status === 'completed'
                                        ? 'bg-emerald-500/90 text-emerald-50'
                                        : log.status === 'skipped'
                                          ? 'bg-amber-500/90 text-amber-50'
                                          : 'bg-muted text-foreground'
                                }`}
                                title={`${log.logged_for}: ${log.status}`}
                            >
                                {new Date(log.logged_for).getDate()}
                            </span>
                        ))}
                        {habit.recent_logs.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Log entries to see your streak history.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface DetailTileProps {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}

function DetailTile({ label, value, icon: Icon }: DetailTileProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

interface StreakTileProps {
    title: string;
    description: string;
    value: string;
    hint?: string;
}

function StreakTile({ title, description, value, hint }: StreakTileProps) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-primary" />
                {title}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
