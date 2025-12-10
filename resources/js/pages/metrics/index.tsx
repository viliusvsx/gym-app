
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BodyMetricController from '@/actions/App/Http/Controllers/Metrics/BodyMetricController';
import AppLayout from '@/layouts/app-layout';
import { index as metricsIndex } from '@/routes/metrics';
import { index as workoutsIndex } from '@/routes/workouts';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Activity, Camera, Image as ImageIcon, LineChart, NotebookPen } from 'lucide-react';

interface MetricPhoto {
    id: number;
    caption?: string | null;
    url: string;
}

interface MetricEntry {
    id: number;
    recorded_at: string;
    weight_kg?: number | null;
    body_fat_percent?: number | null;
    waist_cm?: number | null;
    chest_cm?: number | null;
    hips_cm?: number | null;
    arm_cm?: number | null;
    thigh_cm?: number | null;
    notes?: string | null;
    photos: MetricPhoto[];
}

interface TrendPoint {
    date: string;
    weight_kg: number | null;
}

interface MetricsPageProps {
    metrics: MetricEntry[];
    weightTrend: TrendPoint[];
    unitSystem: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Metrics',
        href: metricsIndex().url,
    },
];

const today = new Date().toISOString().slice(0, 10);

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export default function Metrics({ metrics, weightTrend }: MetricsPageProps) {
    const form = useForm({
        recorded_at: today,
        weight_kg: '',
        body_fat_percent: '',
        waist_cm: '',
        chest_cm: '',
        hips_cm: '',
        arm_cm: '',
        thigh_cm: '',
        notes: '',
        photos: [] as File[],
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            recorded_at: data.recorded_at,
            weight_kg: data.weight_kg === '' ? null : Number(data.weight_kg),
            body_fat_percent:
                data.body_fat_percent === ''
                    ? null
                    : Number(data.body_fat_percent),
            waist_cm: data.waist_cm === '' ? null : Number(data.waist_cm),
            chest_cm: data.chest_cm === '' ? null : Number(data.chest_cm),
            hips_cm: data.hips_cm === '' ? null : Number(data.hips_cm),
            arm_cm: data.arm_cm === '' ? null : Number(data.arm_cm),
            thigh_cm: data.thigh_cm === '' ? null : Number(data.thigh_cm),
            notes: data.notes || null,
            photos: data.photos,
        }));

        form.post(BodyMetricController.store().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('notes', 'photos'),
        });
    };

    const latestWeight = weightTrend[weightTrend.length - 1];
    const previousWeight = weightTrend[weightTrend.length - 2];
    const latestWeightValue = toNumber(latestWeight?.weight_kg);
    const previousWeightValue = toNumber(previousWeight?.weight_kg);
    const weightDelta =
        latestWeightValue !== null && previousWeightValue !== null
            ? latestWeightValue - previousWeightValue
            : null;
    const photoCount = metrics.reduce(
        (acc, entry) => acc + (entry.photos?.length ?? 0),
        0,
    );
    const entriesCount = metrics.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Metrics" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
                <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-xl">Body metrics</CardTitle>
                            <CardDescription>
                                All metric inputs are kilogram/centimeter only. Track weight and visuals together.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={workoutsIndex().url}>Log workout</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href={metricsIndex().url}>Refresh</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        <StatTile
                            icon={LineChart}
                            label="Latest weight"
                            value={
                                latestWeightValue !== null
                                    ? `${latestWeightValue.toFixed(1)} kg`
                                    : 'No data'
                            }
                            hint={
                                weightDelta !== null
                                    ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg vs last`
                                    : 'Add two entries for delta'
                            }
                        />
                        <StatTile
                            icon={Activity}
                            label="Entries"
                            value={entriesCount}
                            hint={`${photoCount} photos total`}
                        />
                        <StatTile
                            icon={NotebookPen}
                            label="Notes logged"
                            value={metrics.filter((m) => !!m.notes).length}
                            hint="Add context for better trends"
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Track metrics</CardTitle>
                            <CardDescription>
                                Kilograms and centimeters only. Photos up to 10 MB each.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="recorded_at">Date</Label>
                                        <Input
                                            id="recorded_at"
                                            type="date"
                                            value={form.data.recorded_at}
                                            onChange={(e) =>
                                                form.setData('recorded_at', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={form.errors.recorded_at}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            inputMode="decimal"
                                            value={form.data.weight_kg}
                                            onChange={(e) =>
                                                form.setData('weight_kg', e.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.weight_kg} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="body_fat_percent">
                                            Body fat %
                                        </Label>
                                        <Input
                                            id="body_fat_percent"
                                            type="number"
                                            inputMode="decimal"
                                            value={form.data.body_fat_percent}
                                            onChange={(e) =>
                                                form.setData(
                                                    'body_fat_percent',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.body_fat_percent}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    {[
                                        ['waist_cm', 'Waist (cm)'],
                                        ['chest_cm', 'Chest (cm)'],
                                        ['hips_cm', 'Hips (cm)'],
                                        ['arm_cm', 'Arm (cm)'],
                                        ['thigh_cm', 'Thigh (cm)'],
                                    ].map(([key, label]) => (
                                        <div key={key} className="space-y-2">
                                            <Label htmlFor={key}>{label}</Label>
                                            <Input
                                                id={key}
                                                type="number"
                                                inputMode="decimal"
                                                value={(form.data as never)[key]}
                                                onChange={(e) =>
                                                    form.setData(
                                                        key as never,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={(form.errors as never)[key]}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData('notes', e.target.value)
                                        }
                                        placeholder="Sleep, hydration, training load..."
                                    />
                                    <InputError message={form.errors.notes} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photos" className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Progress photos (max 10 MB each)
                                    </Label>
                                    <Input
                                        id="photos"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) =>
                                            form.setData(
                                                'photos',
                                                Array.from(e.target.files ?? []),
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.photos} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="gap-2"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    Save metrics
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent entries</CardTitle>
                            <CardDescription>
                                Weight, composition, and photos at a glance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {latestWeight && (
                                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <LineChart className="h-4 w-4" />
                                        Latest weight
                                    </div>
                                    <div className="font-semibold">
                                        {latestWeightValue !== null
                                            ? `${latestWeightValue.toFixed(1)} kg`
                                            : '—'}
                                    </div>
                                </div>
                            )}

                            {metrics.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Add your first metric entry.
                                </div>
                            ) : (
                                metrics.map((metric) => (
                                    <div
                                        key={metric.id}
                                        className="space-y-2 rounded-lg border bg-muted/10 p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">
                                                {metric.recorded_at}
                                            </div>
                                        <Badge variant="outline">
                                            {toNumber(metric.weight_kg) !== null
                                                ? `${toNumber(metric.weight_kg)?.toFixed(1)} kg`
                                                : '—'}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {toNumber(metric.body_fat_percent) !== null && (
                                            <Badge variant="outline">
                                                BF {toNumber(metric.body_fat_percent)?.toFixed(1)}%
                                            </Badge>
                                        )}
                                        {toNumber(metric.waist_cm) !== null && (
                                            <Badge variant="outline">
                                                Waist {toNumber(metric.waist_cm)} cm
                                            </Badge>
                                        )}
                                        {toNumber(metric.chest_cm) !== null && (
                                            <Badge variant="outline">
                                                Chest {toNumber(metric.chest_cm)} cm
                                            </Badge>
                                        )}
                                        {toNumber(metric.hips_cm) !== null && (
                                            <Badge variant="outline">
                                                Hips {toNumber(metric.hips_cm)} cm
                                            </Badge>
                                        )}
                                        {toNumber(metric.arm_cm) !== null && (
                                            <Badge variant="outline">
                                                Arm {toNumber(metric.arm_cm)} cm
                                            </Badge>
                                        )}
                                        {toNumber(metric.thigh_cm) !== null && (
                                            <Badge variant="outline">
                                                Thigh {toNumber(metric.thigh_cm)} cm
                                            </Badge>
                                        )}
                                        </div>
                                        {metric.photos.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {metric.photos.map((photo) => (
                                                    <img
                                                        key={photo.id}
                                                        src={photo.url}
                                                        alt={photo.caption ?? ''}
                                                        className="h-20 w-full rounded-md object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {metric.notes && (
                                            <p className="text-xs text-muted-foreground">
                                                {metric.notes}
                                            </p>
                                        )}
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
