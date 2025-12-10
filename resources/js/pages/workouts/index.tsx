
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import WorkoutSessionController from '@/actions/App/Http/Controllers/Workouts/WorkoutSessionController';
import { index as workoutsIndex } from '@/routes/workouts';
import { index as metricsIndex } from '@/routes/metrics';
import { index as programsIndex } from '@/routes/programs';
import { index as exercisesIndex } from '@/routes/exercises';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Activity, BarChart3, CalendarClock, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

type Exercise = {
    id: number;
    name: string;
    category?: string | null;
    equipment?: string | null;
    primary_muscles?: string[];
    is_custom: boolean;
};

type SessionSet = {
    id: number;
    exercise: string | null;
    reps: number | null;
    weight_kg: number | null;
    rpe: number | null;
    is_warmup: boolean;
};

type Session = {
    id: number;
    name: string;
    performed_at: string | null;
    notes?: string | null;
    volume: number;
    sets: SessionSet[];
};

type ProgramBlock = {
    id: number;
    title: string;
    sequence: number;
    week_count?: number;
    is_deload?: boolean;
};

type Program = {
    id: number;
    name: string;
    blocks: ProgramBlock[];
};

interface WorkoutsPageProps {
    sessions: Session[];
    exercises: Exercise[];
    programs: Program[];
    unitSystem: string;
}

type WorkoutSetForm = {
    exercise_id: number | '';
    reps: number | '';
    weight_kg: number | '';
    rpe: number | '';
    rir?: number | '';
    percentage_of_one_rm?: number | '';
    is_warmup: boolean;
    rest_seconds?: number | '';
    tempo?: string;
    notes?: string;
    superset_label?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Workouts',
        href: workoutsIndex().url,
    },
];

const formatDateTimeLocal = (value: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export default function Workouts({
    sessions,
    exercises,
    programs,
}: WorkoutsPageProps) {
    const defaultSet: WorkoutSetForm = {
        exercise_id: exercises[0]?.id ?? '',
        reps: 8,
        weight_kg: '',
        rpe: 7.5,
        rir: '',
        percentage_of_one_rm: '',
        is_warmup: false,
        rest_seconds: 120,
        tempo: '',
        notes: '',
        superset_label: '',
    };

    const form = useForm({
        name: 'Training session',
        performed_at: formatDateTimeLocal(new Date()),
        durationMinutes: 60,
        program_id: 'none',
        program_block_id: 'none',
        notes: '',
        sets: [defaultSet],
    });

    const selectedProgramBlocks = useMemo(() => {
        const program = programs.find(
            (item) => item.id === Number(form.data.program_id),
        );

        return program?.blocks ?? [];
    }, [form.data.program_id, programs]);

    const lastSession = sessions[0];
    const lastSessionVolume =
        lastSession && toNumber(lastSession.volume) !== null
            ? toNumber(lastSession.volume)
            : null;
    const totalSets = sessions.reduce(
        (acc, session) => acc + (session.sets?.length ?? 0),
        0,
    );
    const totalSessions = sessions.length;

    const handleAddSet = () => {
        form.setData('sets', [
            ...form.data.sets,
            {
                ...defaultSet,
                exercise_id:
                    form.data.sets[form.data.sets.length - 1]?.exercise_id ||
                    exercises[0]?.id ||
                    '',
            },
        ]);
    };

    const handleRemoveSet = (index: number) => {
        if (form.data.sets.length === 1) {
            return;
        }

        form.setData(
            'sets',
            form.data.sets.filter((_, i) => i !== index),
        );
    };

    const handleSetChange = (
        index: number,
        key: keyof WorkoutSetForm,
        value: string | number | boolean,
    ) => {
        const updated = [...form.data.sets];
        updated[index] = { ...updated[index], [key]: value } as WorkoutSetForm;
        form.setData('sets', updated);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            name: data.name,
            performed_at: data.performed_at,
            duration_seconds: data.durationMinutes
                ? Number(data.durationMinutes) * 60
                : null,
            program_id: data.program_id === 'none' ? null : Number(data.program_id),
            program_block_id:
                data.program_block_id === 'none'
                    ? null
                    : Number(data.program_block_id),
            notes: data.notes || null,
            sets: data.sets.map((set, index) => ({
                exercise_id: set.exercise_id ? Number(set.exercise_id) : null,
                sequence: index + 1,
                reps: set.reps === '' ? null : Number(set.reps),
                weight_kg:
                    set.weight_kg === '' ? null : Number(set.weight_kg),
                rpe: set.rpe === '' ? null : Number(set.rpe),
                rir: set.rir === '' ? null : Number(set.rir),
                percentage_of_one_rm:
                    set.percentage_of_one_rm === ''
                        ? null
                        : Number(set.percentage_of_one_rm),
                is_warmup: Boolean(set.is_warmup),
                rest_seconds:
                    set.rest_seconds === '' ? null : Number(set.rest_seconds),
                tempo: set.tempo || null,
                notes: set.notes || null,
                superset_label: set.superset_label || null,
            })),
        }));

        form.post(WorkoutSessionController.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('sets', [defaultSet]);
                form.setData('performed_at', formatDateTimeLocal(new Date()));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workouts" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-xl">Training HQ</CardTitle>
                            <CardDescription>
                                Log sessions fast, stay metric-first, and keep supersets tidy.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={exercisesIndex().url}>
                                    Manage exercises
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={metricsIndex().url}>
                                    Add metrics
                                </Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href={programsIndex().url}>
                                    Programs
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        <StatTile
                            icon={BarChart3}
                            label="Last session volume"
                            value={
                                lastSessionVolume !== null
                                    ? `${lastSessionVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`
                                    : 'No data yet'
                            }
                            hint={lastSession?.name}
                        />
                        <StatTile
                            icon={Activity}
                            label="Sets logged"
                            value={totalSets}
                            hint={`${totalSessions} sessions`}
                        />
                        <StatTile
                            icon={CalendarClock}
                            label="Scheduled program"
                            value={
                                form.data.program_id !== 'none'
                                    ? programs.find(
                                          (program) =>
                                              program.id ===
                                              Number(form.data.program_id),
                                      )?.name ?? 'Program selected'
                                    : 'None selected'
                            }
                            hint="Keep blocks aligned with sessions"
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle>Log a workout</CardTitle>
                            <CardDescription>
                                Metric-first logging with warmups, supersets, RPE, and notes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                                encType="multipart/form-data"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Session name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={form.data.name}
                                            onChange={(e) =>
                                                form.setData('name', e.target.value)
                                            }
                                            placeholder="Lower / Upper / Full body"
                                        />
                                        <InputError message={form.errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="performed_at">
                                            Date & time
                                        </Label>
                                        <Input
                                            id="performed_at"
                                            type="datetime-local"
                                            name="performed_at"
                                            value={form.data.performed_at}
                                            onChange={(e) =>
                                                form.setData(
                                                    'performed_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.performed_at}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="durationMinutes">
                                            Duration (minutes)
                                        </Label>
                                        <Input
                                            id="durationMinutes"
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={form.data.durationMinutes}
                                            onChange={(e) =>
                                                form.setData(
                                                    'durationMinutes',
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.duration_seconds}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="program_id">Program</Label>
                                        <Select
                                            value={form.data.program_id}
                                            onValueChange={(value) => {
                                                form.setData('program_id', value);
                                                form.setData('program_block_id', 'none');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Optional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    None
                                                </SelectItem>
                                                {programs.map((program) => (
                                                    <SelectItem
                                                        key={program.id}
                                                        value={program.id.toString()}
                                                    >
                                                        {program.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={form.errors.program_id}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="program_block_id">
                                            Block
                                        </Label>
                                        <Select
                                            value={form.data.program_block_id}
                                            onValueChange={(value) =>
                                                form.setData('program_block_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Optional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    None
                                                </SelectItem>
                                                {selectedProgramBlocks.map((block) => (
                                                    <SelectItem
                                                        key={block.id}
                                                        value={block.id.toString()}
                                                    >
                                                        {block.title}
                                                        {block.is_deload
                                                            ? ' · Deload'
                                                            : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={form.errors.program_block_id}
                                        />
                                    </div>
                                </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Sets
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Track kilograms, reps, RPE/RIR, and
                                            supersets.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleAddSet}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add set
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {form.data.sets.map((set, index) => (
                                        <div
                                            key={index}
                                                className="grid gap-3 rounded-lg border border-dashed p-3 md:grid-cols-4"
                                        >
                                            <div className="flex items-start justify-between gap-3 md:col-span-4">
                                                <Badge variant="outline">
                                                    Set {index + 1}
                                                </Badge>
                                                {form.data.sets.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleRemoveSet(index)
                                                        }
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Exercise
                                                </Label>
                                                <Select
                                                    value={
                                                        set.exercise_id?.toString() ||
                                                        ''
                                                    }
                                                    onValueChange={(value) =>
                                                        handleSetChange(
                                                            index,
                                                            'exercise_id',
                                                            Number(value),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {exercises.map(
                                                            (exercise) => (
                                                                <SelectItem
                                                                    key={exercise.id}
                                                                    value={exercise.id.toString()}
                                                                >
                                                                    {exercise.name}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.exercise_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Weight (kg)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={set.weight_kg ?? ''}
                                                    onChange={(e) =>
                                                        handleSetChange(
                                                            index,
                                                            'weight_kg',
                                                            e.target.value === ''
                                                                ? ''
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.weight_kg`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Reps
                                                </Label>
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={set.reps ?? ''}
                                                    onChange={(e) =>
                                                        handleSetChange(
                                                            index,
                                                            'reps',
                                                            e.target.value === ''
                                                                ? ''
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                    placeholder="5"
                                                />
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.reps`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    RPE
                                                </Label>
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    step={0.5}
                                                    value={set.rpe ?? ''}
                                                    onChange={(e) =>
                                                        handleSetChange(
                                                            index,
                                                            'rpe',
                                                            e.target.value === ''
                                                                ? ''
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                    placeholder="7.5"
                                                />
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.rpe`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Superset label (optional)
                                                </Label>
                                                <Input
                                                    value={set.superset_label || ''}
                                                    onChange={(e) =>
                                                        handleSetChange(
                                                            index,
                                                            'superset_label',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="A1, A2, B1..."
                                                />
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.superset_label`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                        Rest (s)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        inputMode="numeric"
                                                        value={set.rest_seconds ?? ''}
                                                        onChange={(e) =>
                                                            handleSetChange(
                                                                index,
                                                                'rest_seconds',
                                                                e.target.value === ''
                                                                    ? ''
                                                                    : Number(
                                                                          e.target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        placeholder="120"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors[
                                                                `sets.${index}.rest_seconds`
                                                            ]
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                        Tempo
                                                    </Label>
                                                    <Input
                                                        value={set.tempo || ''}
                                                        onChange={(e) =>
                                                            handleSetChange(
                                                                index,
                                                                'tempo',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="31X1"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors[
                                                                `sets.${index}.tempo`
                                                            ]
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 rounded-md border px-3">
                                                    <Checkbox
                                                        id={`warmup-${index}`}
                                                        checked={set.is_warmup}
                                                        onCheckedChange={(checked) =>
                                                            handleSetChange(
                                                                index,
                                                                'is_warmup',
                                                                Boolean(checked),
                                                            )
                                                        }
                                                    />
                                                    <Label htmlFor={`warmup-${index}`}>
                                                        Warmup
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="md:col-span-3">
                                                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Notes
                                                </Label>
                                                <textarea
                                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    value={set.notes || ''}
                                                    onChange={(e) =>
                                                        handleSetChange(
                                                            index,
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Cues, tempo tweaks, how it felt..."
                                                />
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `sets.${index}.notes`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Session notes
                                </Label>
                                <textarea
                                    className="mt-1 min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                    placeholder="Intent, sleep, nutrition, anything that matters."
                                />
                                <InputError message={form.errors.notes} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : 'Save workout'}
                                </Button>
                                {form.recentlySuccessful && (
                                    <span className="text-sm text-muted-foreground">
                                        Saved
                                    </span>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent sessions</CardTitle>
                        <CardDescription>Latest logs with volume</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sessions.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                Log your first workout to see it here.
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="rounded-lg border bg-muted/20 p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                {session.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {session.performed_at
                                                    ? new Date(
                                                          session.performed_at,
                                                      ).toLocaleString()
                                                    : ''}
                                            </div>
                                        </div>
                                        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                            {toNumber(session.volume) !== null
                                                ? `${toNumber(session.volume)?.toFixed(1)} kg`
                                                : '— kg'}
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {session.sets.map((set) => (
                                            <div
                                                key={set.id}
                                                className="flex items-center justify-between rounded-md border border-dashed bg-background/70 px-3 py-2 text-sm"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {set.exercise}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {toNumber(set.weight_kg) !== null
                                                            ? `${toNumber(set.weight_kg)?.toFixed(1)} kg`
                                                            : '— kg'}{' '}
                                                        × {set.reps}{' '}
                                                        {set.rpe
                                                            ? `@ RPE ${set.rpe}`
                                                            : ''}
                                                    </span>
                                                </div>
                                                {set.is_warmup && (
                                                    <Badge variant="outline">
                                                        Warmup
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
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

function StatTile({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof Activity;
    label: string;
    value: string | number;
    hint?: string | null;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-background/80 px-4 py-3 shadow-xs">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>
                <p className="text-lg font-semibold">{value}</p>
                {hint ? (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                ) : null}
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
        </div>
    );
}
