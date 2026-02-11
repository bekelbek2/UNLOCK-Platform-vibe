'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Award, Pencil, GripVertical } from 'lucide-react';
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useProfileData, type Honor } from '@/lib/profileStore';
import { GRADE_LEVELS, RECOGNITION_LEVELS } from '@/lib/schemas/education-form';

// ─── Schema ──────────────────────────────────────────────────────────────────

const honorFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
    gradeLevels: z.array(z.string()).min(1, 'Select at least one grade level'),
    recognitionLevels: z.array(z.string()).min(1, 'Select at least one recognition level'),
});

type HonorFormData = z.infer<typeof honorFormSchema>;

const MAX_HONORS = 5;

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
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onEdit(honor)}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <button
                        type="button"
                        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                        onClick={(e) => e.stopPropagation()}
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Award className="w-5 h-5 text-[#C26E26]" />
                            </div>
                            <h4 className="font-semibold text-gray-900 truncate">
                                {honor.title}
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-12">
                            {honor.gradeLevels.map((g) => (
                                <span
                                    key={g}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                                >
                                    Grade {g}
                                </span>
                            ))}
                            {honor.recognitionLevels.map((r) => (
                                <span
                                    key={r}
                                    className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(honor);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#C26E26] hover:bg-amber-50 rounded-lg transition"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(honor.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HonorsTab() {
    const { data, setHonors } = useProfileData();
    const honors = data.honors;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHonor, setEditingHonor] = useState<Honor | null>(null);

    const form = useForm<HonorFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(honorFormSchema) as any,
        defaultValues: {
            title: '',
            gradeLevels: [],
            recognitionLevels: [],
        },
    });

    // ─── Handlers ────────────────────────────────────────────────────────────

    const openAddDialog = () => {
        setEditingHonor(null);
        form.reset({ title: '', gradeLevels: [], recognitionLevels: [] });
        setDialogOpen(true);
    };

    const openEditDialog = (honor: Honor) => {
        setEditingHonor(honor);
        form.reset({
            title: honor.title,
            gradeLevels: honor.gradeLevels,
            recognitionLevels: honor.recognitionLevels,
        });
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setEditingHonor(null);
            form.reset();
        }
    };

    const onSubmit = (formData: HonorFormData) => {
        if (editingHonor) {
            // Update existing
            const updated = honors.map((h) =>
                h.id === editingHonor.id ? { ...h, ...formData } : h
            );
            setHonors(updated);
            toast.success('Honor updated successfully.');
        } else {
            // Add new
            const newHonor: Honor = {
                id: Date.now().toString(),
                ...formData,
            };
            setHonors([...honors, newHonor]);
            toast.success('Honor added successfully.');
        }
        setDialogOpen(false);
        setEditingHonor(null);
        form.reset();
    };

    const deleteHonor = (id: string) => {
        setHonors(honors.filter((h) => h.id !== id));
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
            setHonors(arrayMove(honors, oldIndex, newIndex));
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Academic Honors ({honors.length}/{MAX_HONORS})
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Report up to {MAX_HONORS} honors or awards you have received.
                    </p>
                </div>
                <Button
                    onClick={openAddDialog}
                    disabled={honors.length >= MAX_HONORS}
                    className="bg-[#C26E26] hover:bg-[#A85A1E] text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Honor
                </Button>
            </div>

            {/* Empty state */}
            {honors.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No honors added yet</p>
                    <p className="text-gray-400 text-sm">
                        Click &quot;Add Honor&quot; to report your awards and recognitions.
                    </p>
                </div>
            )}

            {/* Honors Cards */}
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
                        <div className="grid gap-4">
                            {honors.map((honor) => (
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

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingHonor ? 'Edit Honor' : 'Add Honor'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingHonor
                                ? 'Update the details for this honor.'
                                : 'Provide details about your honor or award.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Title <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter honor title (max 100 chars)"
                                                maxLength={100}
                                                className="focus-visible:ring-[#C26E26]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500 text-right">
                                            {field.value.length}/100
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Grade Levels */}
                            <FormField
                                control={form.control}
                                name="gradeLevels"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Grade Level(s) <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {GRADE_LEVELS.map((grade) => (
                                                <div key={grade} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`honor-grade-${grade}`}
                                                        checked={field.value?.includes(grade)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...field.value, grade]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter((v: string) => v !== grade)
                                                                );
                                                            }
                                                        }}
                                                        className="border-[#C26E26] data-[state=checked]:bg-[#C26E26] data-[state=checked]:border-[#C26E26]"
                                                    />
                                                    <Label
                                                        htmlFor={`honor-grade-${grade}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {grade}
                                                    </Label>
                                                </div>
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Level of Recognition{' '}
                                            <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {RECOGNITION_LEVELS.map((level) => (
                                                <div key={level} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`honor-recognition-${level}`}
                                                        checked={field.value?.includes(level)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...field.value, level]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (v: string) => v !== level
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        className="border-[#C26E26] data-[state=checked]:bg-[#C26E26] data-[state=checked]:border-[#C26E26]"
                                                    />
                                                    <Label
                                                        htmlFor={`honor-recognition-${level}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {level}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleDialogChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#C26E26] hover:bg-[#A85A1E] text-white"
                                >
                                    {editingHonor ? 'Save Changes' : 'Add Honor'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
