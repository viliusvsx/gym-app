
import InputError from '@/components/input-error';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import ExerciseController from '@/actions/App/Http/Controllers/Exercises/ExerciseController';
import { index as exercisesIndex } from '@/routes/exercises';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Sparkles } from 'lucide-react';

interface ExerciseDto {
    id: number;
    name: string;
    category?: string | null;
    equipment?: string | null;
    primary_muscles?: string[] | null;
    is_custom: boolean;
    notes?: string | null;
}

interface ExercisesPageProps {
    exercisesByCategory: Record<string, ExerciseDto[]>;
    unitSystem: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Exercises',
        href: exercisesIndex().url,
    },
];

export default function Exercises({ exercisesByCategory }: ExercisesPageProps) {
    const form = useForm({
        name: '',
        category: '',
        equipment: '',
        primary_muscles: '',
        notes: '',
        video_url: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            name: data.name,
            category: data.category || null,
            equipment: data.equipment || null,
            notes: data.notes || null,
            video_url: data.video_url || null,
            primary_muscles: data.primary_muscles
                ? data.primary_muscles
                      .split(',')
                      .map((muscle) => muscle.trim())
                      .filter(Boolean)
                : [],
        }));

        form.post(ExerciseController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="grid gap-4 p-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Library</CardTitle>
                        <CardDescription>
                            Base lifts and your custom additions, grouped by
                            category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(exercisesByCategory).length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No exercises yet.
                            </div>
                        )}
                        {Object.entries(exercisesByCategory).map(
                            ([category, items]) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold">
                                            {category}
                                        </h3>
                                        {category === 'Strength' && (
                                            <Badge variant="outline">
                                                Big lifts
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {items.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="flex items-start justify-between rounded-lg border px-3 py-2"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {exercise.name}
                                                        </span>
                                                        {exercise.is_custom && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px]"
                                                            >
                                                                Custom
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {exercise.equipment || 'Bodyweight'}
                                                    </div>
                                                    {exercise.primary_muscles && (
                                                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                                                            {exercise.primary_muscles.map(
                                                                (muscle) => (
                                                                    <Badge
                                                                        key={`${exercise.id}-${muscle}`}
                                                                        variant="outline"
                                                                        className="border-dashed text-[10px]"
                                                                    >
                                                                        {muscle}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Sparkles className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add exercise</CardTitle>
                        <CardDescription>
                            Capture custom movements in the metric system.
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
                                    placeholder="Paused squat, tempo press..."
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData(
                                            'category',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Strength, Accessory, Conditioning"
                                />
                                <InputError message={form.errors.category} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="equipment">Equipment</Label>
                                <Input
                                    id="equipment"
                                    value={form.data.equipment}
                                    onChange={(e) =>
                                        form.setData(
                                            'equipment',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Barbell, Dumbbell, Machine"
                                />
                                <InputError message={form.errors.equipment} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primary_muscles">
                                    Primary muscles
                                </Label>
                                <Input
                                    id="primary_muscles"
                                    value={form.data.primary_muscles}
                                    onChange={(e) =>
                                        form.setData(
                                            'primary_muscles',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Comma separated (quads, glutes, core)"
                                />
                                <InputError
                                    message={form.errors.primary_muscles}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_url">Video URL</Label>
                                <Input
                                    id="video_url"
                                    value={form.data.video_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'video_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://..."
                                />
                                <InputError message={form.errors.video_url} />
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
                                    placeholder="Cues, tempo, intent"
                                />
                                <InputError message={form.errors.notes} />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Save exercise
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
