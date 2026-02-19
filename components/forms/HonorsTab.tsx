'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, Award, Eye, EyeOff, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProfileData, type Honor } from '@/lib/profileStore';
// import { GRADE_LEVELS, RECOGNITION_LEVELS } from '@/lib/schemas/education-form'; // Removed, now local

// Constants
const GRADE_LEVELS = ['9', '10', '11', '12', 'Post-Graduate'] as const;
const RECOGNITION_LEVELS = ['School', 'State/Regional', 'National', 'International'] as const;

const MAX_HONORS = 10;

// Schema
const honorFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
    gradeLevels: z.array(z.string()).min(1, 'Select at least one grade level'),
    recognitionLevels: z.array(z.string()).min(1, 'Select at least one recognition level'),
    status: z.enum(['draft', 'ready']),
    appearOnProfile: z.boolean().default(false),
});

type HonorFormData = z.infer<typeof honorFormSchema>;

// Character counter component
function CharacterCounter({ current, max }: { current: number; max: number }) {
    const isNearLimit = current >= max * 0.9;
    const isAtLimit = current >= max;

    return (
        <span className={`text-xs ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {current}/{max}
        </span>
    );
}

// ─── Sortable Honor Card ─────────────────────────────────────────────────────
function SortableHonorCard({
    honor,
    onEdit,
    onDelete,
}: {
    honor: Honor;
    onEdit: (honor: Honor) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: honor.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-1"
            onClick={() => onEdit(honor)}
        >
            <CardHeader className="py-3 px-4 pb-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <button
                            type="button"
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                            onClick={(e) => e.stopPropagation()}
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="w-5 h-5" />
                        </button>

                        <div className="p-2 bg-amber-50 rounded-lg hidden sm:block">
                            <Award className="w-5 h-5 text-[#C26E26]" />
                        </div>

                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{honor.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit/Delete Actions - Visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); onEdit(honor); }}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(honor.id); }}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Badge */}
                        {honor.status === 'ready' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-sm px-3 py-1">Ready</Badge>
                        ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-300 text-sm px-3 py-1">Draft</Badge>
                        )}

                        {/* Visibility Badge */}
                        {honor.appearOnProfile ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1 text-sm px-3 py-1">
                                <Eye className="w-3 h-3" /> Visible
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200 gap-1 text-sm px-3 py-1">
                                <EyeOff className="w-3 h-3" /> Hidden
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-3 px-4 pt-1 pb-4">
                <div className="flex flex-col gap-2 ml-8 sm:ml-20">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {honor.gradeLevels.map((g) => (
                            <span
                                key={g}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100"
                            >
                                Grade {g}
                            </span>
                        ))}
                        {honor.recognitionLevels.map((r) => (
                            <span
                                key={r}
                                className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-100"
                            >
                                {r}
                            </span>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HonorsTab() {
    const { data: profileData, setHonors: updateStoreHonors } = useProfileData();
    const [honors, setHonors] = useState<Honor[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<HonorFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(honorFormSchema) as any,
        defaultValues: {
            title: '',
            gradeLevels: [],
            recognitionLevels: [],
            status: 'draft',
            appearOnProfile: false,
        },
    });

    const watchTitle = form.watch('title') || '';
    const isAtLimit = honors.length >= MAX_HONORS;

    // Sync from store
    useEffect(() => {
        if (profileData.honors) {
            setHonors(profileData.honors);
        }
    }, [profileData.honors]);

    const updateHonors = (newHonors: Honor[]) => {
        setHonors(newHonors);
        updateStoreHonors(newHonors);
        toast.success(editingId ? 'Honor updated successfully.' : 'Honor added successfully.');
    };

    const onSubmit = (data: HonorFormData) => {
        let newHonors: Honor[];
        if (editingId) {
            newHonors = honors.map((h) => (h.id === editingId ? { ...data, id: editingId } : h));
        } else {
            const newHonor: Honor = {
                ...data,
                id: crypto.randomUUID(),
            };
            newHonors = [...honors, newHonor];
        }
        updateHonors(newHonors);
        form.reset();
        setEditingId(null);
        setDialogOpen(false);
    };

    const deleteHonor = (id: string) => {
        const newHonors = honors.filter((h) => h.id !== id);
        updateHonors(newHonors);
        toast.success('Honor removed.');
    };

    // ─── Drag & Drop ─────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = honors.findIndex((h) => h.id === active.id);
            const newIndex = honors.findIndex((h) => h.id === over.id);
            const newHonors = arrayMove(honors, oldIndex, newIndex);
            updateHonors(newHonors);
        }
    };

    const openEditDialog = (honor: Honor) => {
        setEditingId(honor.id);
        form.reset({
            title: honor.title,
            gradeLevels: honor.gradeLevels,
            recognitionLevels: honor.recognitionLevels,
            status: honor.status || 'draft',
            appearOnProfile: honor.appearOnProfile || false,
        });
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            form.reset({ status: 'draft', appearOnProfile: false });
            setEditingId(null);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Honors & Awards</h2>
                    <p className="text-sm text-muted-foreground">
                        Add your academic honors and awards ({honors.length}/{MAX_HONORS})
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                            disabled={isAtLimit}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Honor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Edit Honor' : 'Add Honor'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* Top Controls: Status and Visibility */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Status</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex gap-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="draft" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-muted-foreground">
                                                                Draft
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="ready" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal font-semibold text-green-700">
                                                                Ready
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="appearOnProfile"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-white shadow-sm">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Show on Profile Section
                                                    </FormLabel>
                                                    <FormDescription>
                                                        If checked, this will appear in your official Profile summary.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Waitlist / Honor Title <span className="text-red-500">*</span></FormLabel>
                                                <CharacterCounter current={watchTitle.length} max={100} />
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., National Merit Finalist"
                                                    maxLength={100}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Grade Levels */}
                                <FormField
                                    control={form.control}
                                    name="gradeLevels"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Grade Level(s) <span className="text-red-500">*</span></FormLabel>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {GRADE_LEVELS.map((grade) => (
                                                    <FormField
                                                        key={grade}
                                                        control={form.control}
                                                        name="gradeLevels"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(grade)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...current, grade]);
                                                                            } else {
                                                                                field.onChange(current.filter((v) => v !== grade));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <Label className="text-sm font-normal cursor-pointer">
                                                                    {grade}
                                                                </Label>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Recognition Levels */}
                                <FormField
                                    control={form.control}
                                    name="recognitionLevels"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Level of Recognition <span className="text-red-500">*</span></FormLabel>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {RECOGNITION_LEVELS.map((level) => (
                                                    <FormField
                                                        key={level}
                                                        control={form.control}
                                                        name="recognitionLevels"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(level)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...current, level]);
                                                                            } else {
                                                                                field.onChange(current.filter((v) => v !== level));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <Label className="text-sm font-normal cursor-pointer">
                                                                    {level}
                                                                </Label>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDialogChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                                    >
                                        {editingId ? 'Save Changes' : 'Add Honor'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {honors.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No honors added yet
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add your first honor
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Honors List */}
            {honors.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={honors.map((h) => h.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {honors.map((honor, index) => (
                                <SortableHonorCard
                                    key={honor.id}
                                    honor={honor}
                                    onEdit={openEditDialog}
                                    onDelete={deleteHonor}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

        </div>
    );
}
