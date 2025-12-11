import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import {
    cancelReservation,
    createClass,
    reserve,
    scheduleIndex,
} from '@/lib/schedule-routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, List, MapPin, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

type TimeSlot = {
    id: number;
    title: string;
    starts_at: string;
    ends_at: string;
    location?: string | null;
    coach?: string | null;
    capacity: number;
    remaining: number;
    waitlisted: number;
    allow_waitlist: boolean;
    reservation?: { id: number; status: string } | null;
};

type CoachSummary = {
    id: number;
    title: string;
    upcoming_slots: number;
    confirmed: number;
    waitlisted: number;
};

type ScheduleProps = {
    timeSlots: TimeSlot[];
    coachSummary: CoachSummary[];
    errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedule',
        href: scheduleIndex(),
    },
];

export default function SchedulePage({ timeSlots = [], coachSummary = [], errors = {} }: ScheduleProps) {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const reservationForm = useForm<{ class_time_slot_id: number } | Record<string, never>>({});
    const classForm = useForm({
        title: '',
        description: '',
        default_capacity: 10,
        waitlist_enabled: true,
        time_slots: [
            {
                starts_at: '',
                ends_at: '',
                capacity: '',
                allow_waitlist: true,
                location: '',
            },
        ],
    });

    const groupedSlots = useMemo(() => {
        return timeSlots.reduce<Record<string, TimeSlot[]>>((groups, slot) => {
            const dateKey = new Date(slot.starts_at).toDateString();
            groups[dateKey] ??= [];
            groups[dateKey].push(slot);
            return groups;
        }, {});
    }, [timeSlots]);

    const submitReservation = (slot: TimeSlot) => {
        reservationForm.post(reserve(), {
            preserveScroll: true,
            data: {
                class_time_slot_id: slot.id,
            },
        });
    };

    const rescindReservation = (slot: TimeSlot) => {
        if (!slot.reservation) return;

        reservationForm.delete(cancelReservation(slot.reservation.id), {
            preserveScroll: true,
        });
    };

    const submitClass = () => {
        classForm.post(createClass(), {
            preserveScroll: true,
            onSuccess: () => classForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule" />

            {Object.keys(errors).length > 0 && (
                <div className="mb-4">
                    <InputError message="There was a problem loading the schedule." />
                </div>
            )}

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Schedule</h1>
                        <p className="text-sm text-muted-foreground">
                            Reserve a spot and see capacity in real time.
                        </p>
                    </div>
                    <ToggleGroup
                        type="single"
                        value={view}
                        onValueChange={(value) => value && setView(value as 'list' | 'calendar')}
                    >
                        <ToggleGroupItem value="list" aria-label="List view">
                            <List className="mr-2 h-4 w-4" /> List
                        </ToggleGroupItem>
                        <ToggleGroupItem value="calendar" aria-label="Calendar view">
                            <CalendarDays className="mr-2 h-4 w-4" /> Calendar
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{view === 'list' ? 'Upcoming classes' : 'Calendar'}</CardTitle>
                                <CardDescription>
                                    {view === 'list'
                                        ? 'Book from the list or switch to calendar view'
                                        : 'Grouped by day with capacity badges'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {view === 'list' ? (
                                <div className="space-y-3">
                                    {timeSlots.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No classes scheduled.</div>
                                    ) : (
                                        timeSlots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="flex flex-col gap-2 rounded-lg border bg-card/50 px-4 py-3 shadow-sm transition hover:border-primary/50 dark:bg-card/60"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-lg font-semibold">{slot.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Intl.DateTimeFormat('en', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }).format(new Date(slot.starts_at))}{' '}
                                                            –
                                                            {new Intl.DateTimeFormat('en', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }).format(new Date(slot.ends_at))}
                                                        </div>
                                                        {slot.location && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <MapPin className="h-3 w-3" /> {slot.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                                            <UsersRound className="h-3 w-3" />
                                                            {slot.remaining}/{slot.capacity}
                                                        </Badge>
                                                        {slot.allow_waitlist && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Waitlist enabled
                                                            </Badge>
                                                        )}
                                                        {slot.reservation?.status === 'waitlisted' && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Waitlisted
                                                            </Badge>
                                                        )}
                                                        {slot.reservation?.status === 'confirmed' && (
                                                            <Badge className="text-xs">Reserved</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-xs text-muted-foreground">
                                                        Coach: {slot.coach ?? 'Unassigned'} · Waitlist: {slot.waitlisted}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {slot.reservation ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => rescindReservation(slot)}
                                                                disabled={reservationForm.processing}
                                                            >
                                                                Rescind
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => submitReservation(slot)}
                                                                disabled={reservationForm.processing}
                                                            >
                                                                Reserve
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(groupedSlots).map(([day, slots]) => (
                                        <div key={day} className="rounded-xl border bg-card/50 p-4 shadow-sm dark:bg-card/60">
                                            <div className="mb-3 text-sm font-semibold text-muted-foreground">{day}</div>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {slots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="flex flex-col gap-2 rounded-lg border px-3 py-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-semibold">{slot.title}</div>
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {slot.remaining}/{slot.capacity}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Intl.DateTimeFormat('en', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }).format(new Date(slot.starts_at))}
                                                            {' - '}
                                                            {new Intl.DateTimeFormat('en', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }).format(new Date(slot.ends_at))}
                                                        </div>
                                                        {slot.reservation ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => rescindReservation(slot)}
                                                                disabled={reservationForm.processing}
                                                            >
                                                                Rescind
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => submitReservation(slot)}
                                                                disabled={reservationForm.processing}
                                                            >
                                                                Reserve
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Create class</CardTitle>
                            <CardDescription>Set capacity and waitlist preference</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={classForm.data.title}
                                    onChange={(e) => classForm.setData('title', e.target.value)}
                                    placeholder="Strength foundations"
                                />
                                <InputError message={classForm.errors.title} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={classForm.data.description}
                                    onChange={(e) => classForm.setData('description', e.target.value)}
                                    placeholder="Pace, focus, equipment notes"
                                />
                                <InputError message={classForm.errors.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        value={classForm.data.default_capacity}
                                        onChange={(e) =>
                                            classForm.setData('default_capacity', Number(e.target.value) || 0)
                                        }
                                    />
                                    <InputError message={classForm.errors.default_capacity} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="starts_at">Start</Label>
                                    <Input
                                        id="starts_at"
                                        type="datetime-local"
                                        value={classForm.data.time_slots[0]?.starts_at}
                                        onChange={(e) =>
                                            classForm.setData('time_slots', [
                                                {
                                                    ...classForm.data.time_slots[0],
                                                    starts_at: e.target.value,
                                                    ends_at: classForm.data.time_slots[0]?.ends_at ?? '',
                                                    capacity: classForm.data.time_slots[0]?.capacity ?? '',
                                                    allow_waitlist: classForm.data.time_slots[0]?.allow_waitlist ?? true,
                                                    location: classForm.data.time_slots[0]?.location ?? '',
                                                },
                                            ])
                                        }
                                    />
                                    <InputError message={classForm.errors['time_slots.0.starts_at'] as string} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="ends_at">End</Label>
                                    <Input
                                        id="ends_at"
                                        type="datetime-local"
                                        value={classForm.data.time_slots[0]?.ends_at}
                                        onChange={(e) =>
                                            classForm.setData('time_slots', [
                                                {
                                                    ...classForm.data.time_slots[0],
                                                    ends_at: e.target.value,
                                                },
                                            ])
                                        }
                                    />
                                    <InputError message={classForm.errors['time_slots.0.ends_at'] as string} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={classForm.data.time_slots[0]?.location}
                                        onChange={(e) =>
                                            classForm.setData('time_slots', [
                                                {
                                                    ...classForm.data.time_slots[0],
                                                    location: e.target.value,
                                                },
                                            ])
                                        }
                                        placeholder="Main studio"
                                    />
                                    <InputError message={classForm.errors['time_slots.0.location'] as string} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="text-xs text-muted-foreground">
                                    Waitlist {classForm.data.waitlist_enabled ? 'enabled' : 'disabled'}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() =>
                                            classForm.setData('waitlist_enabled', !classForm.data.waitlist_enabled)
                                        }
                                    >
                                        {classForm.data.waitlist_enabled ? 'Disable' : 'Enable'} waitlist
                                    </Button>
                                    <Button size="sm" type="button" onClick={submitClass} disabled={classForm.processing}>
                                        Create
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Coach overview</CardTitle>
                        <CardDescription>Attendance and utilization for your classes</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {coachSummary.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No classes yet.</div>
                        ) : (
                            coachSummary.map((summary) => (
                                <div key={summary.id} className="rounded-lg border p-3">
                                    <div className="font-semibold">{summary.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {summary.upcoming_slots} upcoming
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Badge variant="outline">{summary.confirmed} confirmed</Badge>
                                        <Badge variant="secondary">{summary.waitlisted} waitlisted</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
