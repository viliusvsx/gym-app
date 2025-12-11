import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, Dumbbell, Flame, TrendingUp } from 'lucide-react';

type BestLift = {
    exercise: string;
    weight_kg: number;
    reps: number;
    estimated_one_rm: number;
};

type VolumePoint = { day: string; volume: number };

type BodyWeightPoint = { date: string; weight_kg: number | null };

type SessionHighlight = {
    id: number;
    name: string;
    performed_at: string;
    volume: number;
    sets: number;
};

type ReservationHighlight = {
    id: number;
    title: string | undefined;
    status: string;
    starts_at: string | undefined;
};

type CoachUtilization = {
    id: number;
    title: string;
    upcoming: number;
    confirmed: number;
    utilization: number;
};

interface DashboardProps {
    bestLifts: BestLift[];
    volumeByDay: VolumePoint[];
    bodyWeights: BodyWeightPoint[];
    sessionHighlights: SessionHighlight[];
    upcomingReservations: ReservationHighlight[];
    coachUtilization: CoachUtilization[];
    unitSystem: string;
    errors?: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));

export default function Dashboard({
    bestLifts = [],
    volumeByDay = [],
    bodyWeights = [],
    sessionHighlights = [],
    upcomingReservations = [],
    coachUtilization = [],
    errors = {},
}: DashboardProps) {
    const toNumber = (value: number | string | null | undefined) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const latestWeight = bodyWeights[bodyWeights.length - 1];
    const previousWeight = bodyWeights[bodyWeights.length - 2];

    const latestWeightValue = toNumber(latestWeight?.weight_kg);
    const previousWeightValue = toNumber(previousWeight?.weight_kg);

    const weightDelta =
        latestWeightValue !== null && previousWeightValue !== null
            ? latestWeightValue - previousWeightValue
            : null;

    const sessions7d = sessionHighlights.filter((session) => {
        const performed = new Date(session.performed_at);
        return performed >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;

    const volume7d = volumeByDay
        .filter((point) => new Date(point.day) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((total, point) => total + point.volume, 0);

    const topLift = bestLifts[0];
    const topLiftWeight = topLift ? toNumber(topLift.weight_kg) : null;
    const topLiftE1Rm = topLift ? toNumber(topLift.estimated_one_rm) : null;

    const maxVolume = Math.max(...volumeByDay.map((point) => point.volume), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {Object.keys(errors).length > 0 && (
                <div className="mb-4">
                    <InputError message="There was a problem loading your data." />
                </div>
            )}

            <div className="flex flex-col gap-4 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={Dumbbell}
                        title="Sessions (7d)"
                        value={sessions7d}
                        hint="Keep the streak alive"
                    />
                    <StatCard
                        icon={Flame}
                        title="Volume (7d)"
                        value={`${volume7d.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                        })} kg`}
                        hint="Total tonnage moved"
                    />
                    <StatCard
                        icon={Activity}
                        title="Latest body weight"
                        value={
                            latestWeightValue !== null
                                ? `${latestWeightValue.toFixed(1)} kg`
                                : '—'
                        }
                        hint={
                            weightDelta !== null
                                ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg vs last`
                                : 'Track a few entries'
                        }
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Top lift"
                        value={
                            topLift
                                ? `${topLift.exercise} · ${
                                      topLiftWeight !== null
                                          ? `${topLiftWeight.toFixed(1)} kg`
                                          : '— kg'
                                  } x ${topLift.reps}`
                                : 'Log a set to begin'
                        }
                        hint={
                            topLift && topLiftE1Rm !== null
                                ? `e1RM ${topLiftE1Rm.toFixed(1)} kg`
                                : topLift
                                  ? 'Add weight/reps for e1RM'
                                  : ''
                        }
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Training volume</CardTitle>
                                <CardDescription>
                                    Last {Math.min(volumeByDay.length, 14)} sessions
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {volumeByDay.length === 0 ? (
                                <div className="text-muted-foreground text-sm">
                                    Log your first workout to see volume trends.
                                </div>
                            ) : (
                                <div className="flex items-end gap-3">
                                    {volumeByDay.slice(-14).map((point) => {
                                        const height =
                                            maxVolume === 0
                                                ? 0
                                                : Math.max(
                                                      8,
                                                      Math.round((point.volume / maxVolume) * 100),
                                                  );

                                        return (
                                            <div
                                                key={point.day}
                                                className="flex w-full flex-1 flex-col items-center gap-2"
                                            >
                                                <div className="relative flex h-32 w-full items-end rounded-lg bg-muted/60 p-1 dark:bg-muted/30">
                                                    <div
                                                        className="w-full rounded-md bg-gradient-to-b from-primary/80 to-primary text-xs font-semibold text-primary-foreground transition-[height]"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {formatDate(point.day)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Body weight</CardTitle>
                            <CardDescription>Recent check-ins</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {bodyWeights.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Add a metric entry to start seeing your trend.
                                </div>
                            ) : (
                                bodyWeights
                                    .slice(-6)
                                    .reverse()
                                    .map((entry) => (
                                        <div
                                            key={entry.date}
                                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                                        >
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(entry.date)}
                                            </div>
                                            <div className="font-semibold">
                                                {toNumber(entry.weight_kg) !== null
                                                    ? `${toNumber(entry.weight_kg)?.toFixed(1)} kg`
                                                    : '—'}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Best lifts</CardTitle>
                            <CardDescription>Top estimated 1RMs across lifts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {bestLifts.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Log sets with weight and reps to surface best lifts.
                                </div>
                            ) : (
                                bestLifts.map((lift) => (
                                    <div
                                        key={lift.exercise}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                                    >
                                        <div>
                                            <div className="font-medium">{lift.exercise}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {toNumber(lift.weight_kg) !== null
                                                    ? `${toNumber(lift.weight_kg)?.toFixed(1)} kg`
                                                    : '— kg'}{' '}
                                                × {lift.reps} reps
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {toNumber(lift.estimated_one_rm) !== null
                                                ? `e1RM ${toNumber(
                                                      lift.estimated_one_rm,
                                                  )?.toFixed(1)} kg`
                                                : 'e1RM —'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent sessions</CardTitle>
                            <CardDescription>Volume and density at a glance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sessionHighlights.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Start logging workouts to see them here.
                                </div>
                            ) : (
                                sessionHighlights.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex flex-col gap-1 rounded-lg border px-3 py-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">{session.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDateTime(session.performed_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{session.sets} sets</span>
                                            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                            <span>{session.volume.toFixed(1)} kg</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming reservations</CardTitle>
                            <CardDescription>Capacity and waitlist visibility</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingReservations.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Book a class to see it here.
                                </div>
                            ) : (
                                upcomingReservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                                    >
                                        <div>
                                            <div className="font-semibold">{reservation.title ?? 'Class'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {reservation.starts_at ? formatDateTime(reservation.starts_at) : '—'}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                reservation.status === 'waitlisted' ? 'secondary' : 'default'
                                            }
                                        >
                                            {reservation.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coach overview</CardTitle>
                            <CardDescription>Utilization across your classes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {coachUtilization.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Create a class to see attendance.
                                </div>
                            ) : (
                                coachUtilization.map((utilization) => (
                                    <div
                                        key={utilization.id}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                                    >
                                        <div>
                                            <div className="font-semibold">{utilization.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {utilization.upcoming} upcoming · {utilization.confirmed} booked
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {utilization.utilization}%
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    title,
    value,
    hint,
}: {
    icon: typeof Dumbbell;
    title: string;
    value: string | number;
    hint?: string;
}) {
    return (
        <Card className="border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value}</div>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}
