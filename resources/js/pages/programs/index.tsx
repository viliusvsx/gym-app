
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
import ProgramController from '@/actions/App/Http/Controllers/Programs/ProgramController';
import AppLayout from '@/layouts/app-layout';
import { index as programsIndex } from '@/routes/programs';
import { index as workoutsIndex } from '@/routes/workouts';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BarChart3, CalendarClock, Layers, Plus, TimerReset } from 'lucide-react';

interface ProgramBlock {
    id: number;
    title: string;
    sequence: number;
    week_count?: number;
    is_deload?: boolean;
    focus?: string | null;
}

interface ProgramDto {
    id: number;
    name: string;
    description?: string | null;
    starts_on?: string | null;
    ends_on?: string | null;
    is_active: boolean;
    blocks: ProgramBlock[];
    session_count: number;
}

interface ProgramsPageProps {
    programs: ProgramDto[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Programs',
        href: programsIndex().url,
    },
];

export default function Programs({ programs }: ProgramsPageProps) {
    const form = useForm({
        name: '',
        description: '',
        starts_on: '',
        ends_on: '',
        is_active: true,
        block_title: 'Block 1',
        block_week_count: 4,
        block_is_deload: false,
        block_focus: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            name: data.name,
            description: data.description || null,
            starts_on: data.starts_on || null,
            ends_on: data.ends_on || null,
            is_active: data.is_active,
            blocks: [
                {
                    title: data.block_title || 'Block 1',
                    week_count: data.block_week_count || 4,
                    is_deload: data.block_is_deload,
                    sequence: 1,
                    focus: data.block_focus || null,
                },
            ],
        }));

        form.post(ProgramController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const activePrograms = programs.filter((program) => program.is_active).length;
    const totalBlocks = programs.reduce(
        (acc, program) => acc + program.blocks.length,
        0,
    );
    const totalSessions = programs.reduce(
        (acc, program) => acc + program.session_count,
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-xl">Programming</CardTitle>
                            <CardDescription>
                                Structure blocks, deloads, and track how many sessions you’ve banked.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={workoutsIndex().url}>Log workout</Link>
                            </Button>
                            <Button asChild size="sm">
                                <a href="#new-program">New program</a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        <StatTile
                            icon={Layers}
                            label="Active programs"
                            value={activePrograms}
                            hint={`${totalBlocks} blocks total`}
                        />
                        <StatTile
                            icon={BarChart3}
                            label="Sessions planned"
                            value={totalSessions}
                            hint="From all programs"
                        />
                        <StatTile
                            icon={CalendarClock}
                            label="Programs"
                            value={programs.length}
                            hint="Keep dates aligned"
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Your programs</CardTitle>
                            <CardDescription>
                                Blocks, deloads, and session counts at a glance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {programs.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    No programs yet. Create one on the right.
                                </div>
                            )}
                            {programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="rounded-lg border bg-muted/10 p-4 shadow-xs"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold">
                                                    {program.name}
                                                </h3>
                                                {program.is_active ? (
                                                    <Badge variant="default">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Paused
                                                    </Badge>
                                                )}
                                            </div>
                                            {program.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {program.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <CalendarClock className="h-3.5 w-3.5" />
                                                    {program.starts_on || 'TBD'}
                                                </span>
                                                {program.ends_on && (
                                                    <span>→ {program.ends_on}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <TimerReset className="h-3.5 w-3.5" />
                                                    {program.session_count} sessions
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                                        {program.blocks.map((block) => (
                                            <div
                                                key={block.id}
                                                className="flex items-center justify-between rounded-md border border-dashed bg-background/70 px-3 py-2"
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {block.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {block.week_count || 0} weeks
                                                        {block.focus
                                                            ? ` · ${block.focus}`
                                                            : ''}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {block.is_deload && (
                                                        <Badge variant="outline">
                                                            Deload
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        #{block.sequence}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card id="new-program">
                        <CardHeader>
                            <CardTitle>New program</CardTitle>
                            <CardDescription>
                                Set the start/end dates and your first block.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Base Strength"
                                    />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData('description', e.target.value)
                                        }
                                        placeholder="Focus, constraints, goals"
                                    />
                                    <InputError message={form.errors.description} />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="starts_on">Starts on</Label>
                                        <Input
                                            id="starts_on"
                                            type="date"
                                            value={form.data.starts_on}
                                            onChange={(e) =>
                                                form.setData('starts_on', e.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.starts_on} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ends_on">Ends on</Label>
                                        <Input
                                            id="ends_on"
                                            type="date"
                                            value={form.data.ends_on}
                                            onChange={(e) =>
                                                form.setData('ends_on', e.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.ends_on} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData('is_active', Boolean(checked))
                                        }
                                    />
                                    <Label htmlFor="is_active">Active program</Label>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">
                                            First block
                                        </Label>
                                        <Badge variant="outline">Sequence 1</Badge>
                                    </div>
                                    <Input
                                        value={form.data.block_title}
                                        onChange={(e) =>
                                            form.setData('block_title', e.target.value)
                                        }
                                        placeholder="Foundation"
                                    />
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Weeks</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={form.data.block_week_count}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'block_week_count',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Focus</Label>
                                            <Input
                                                value={form.data.block_focus}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'block_focus',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Volume, Intensity, Technique"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                        <Checkbox
                                            id="block_is_deload"
                                            checked={form.data.block_is_deload}
                                            onCheckedChange={(checked) =>
                                                form.setData(
                                                    'block_is_deload',
                                                    Boolean(checked),
                                                )
                                            }
                                        />
                                        <Label htmlFor="block_is_deload">
                                            This is a deload block
                                        </Label>
                                    </div>
                                    <InputError
                                        message={form.errors['blocks.0.title']}
                                    />
                                </div>

                                <Button type="submit" disabled={form.processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Save program
                                </Button>
                            </form>
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
    icon: typeof Layers;
    label: string;
    value: string | number;
    hint?: string;
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
