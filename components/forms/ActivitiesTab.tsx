'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Constants
const ACTIVITY_TYPES = [
    'Academic',
    'Art',
    'Athletics: Club',
    'Athletics: JV/Varsity',
    'Career-Oriented',
    'Community Service (Volunteer)',
    'Computer/Technology',
    'Cultural',
    'Dance',
    'Debate/Speech',
    'Environmental',
    'Family Responsibilities',
    'Journalism/Publication',
    'Junior R.O.T.C.',
    'LGBT',
    'Music: Instrumental',
    'Music: Vocal',
    'Religious',
    'Research',
    'Robotics',
    'School Spirit',
    'Science/Math',
    'Student Govt./Politics',
    'Theater/Drama',
    'Work (Paid)',
    'Other Club/Activity',
] as const;

const GRADE_LEVELS = ['9', '10', '11', '12', 'Post-Graduate'] as const;
const TIMING_OPTIONS = ['During school year', 'During school break', 'All year'] as const;

const MAX_ACTIVITIES = 10;

// Schema
const activitySchema = z.object({
    activityType: z.string().min(1, 'Select an activity type'),
    position: z.string().min(1, 'Position is required').max(50, 'Max 50 characters'),
    organizationName: z.string().min(1, 'Organization name is required').max(100, 'Max 100 characters'),
    description: z.string().min(1, 'Description is required').max(150, 'Max 150 characters'),
    gradeLevels: z.array(z.string()).min(1, 'Select at least one grade level'),
    timing: z.array(z.string()).min(1, 'Select at least one timing option'),
    hoursPerWeek: z.coerce.number().min(1, 'Required').max(168, 'Max 168 hours'),
    weeksPerYear: z.coerce.number().min(1, 'Required').max(52, 'Max 52 weeks'),
    futureIntent: z.enum(['yes', 'no'], { message: 'Select an option' }),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface Activity extends ActivityFormData {
    id: string;
}

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

// ─── Sortable Activity Card ─────────────────────────────────────────────────
function SortableActivityCard({
    activity,
    index,
    onEdit,
    onDelete,
}: {
    activity: Activity;
    index: number;
    onEdit: (activity: Activity) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: activity.id });

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
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEdit(activity)}
        >
            <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
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
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C26E26]/10 text-[#C26E26] font-semibold text-sm flex-shrink-0">
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge variant="secondary" className="bg-[#C26E26]/10 text-[#C26E26] hover:bg-[#C26E26]/20">
                                    {activity.activityType}
                                </Badge>
                                {activity.gradeLevels.map((g) => (
                                    <Badge key={g} variant="outline" className="text-xs">
                                        Grade {g}
                                    </Badge>
                                ))}
                            </div>
                            <h4 className="font-semibold text-base">
                                {activity.position}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {activity.organizationName}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{activity.hoursPerWeek} hrs/week</span>
                                <span>•</span>
                                <span>{activity.weeksPerYear} wks/year</span>
                                {activity.futureIntent === 'yes' && (
                                    <>
                                        <span>•</span>
                                        <span className="text-[#C26E26]">Continuing in college</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(activity.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ActivitiesTab() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<ActivityFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(activitySchema) as any,
        defaultValues: {
            activityType: '',
            position: '',
            organizationName: '',
            description: '',
            gradeLevels: [],
            timing: [],
            hoursPerWeek: '' as unknown as number,
            weeksPerYear: '' as unknown as number,
            futureIntent: '' as unknown as 'yes' | 'no',
        },
    });

    const watchPosition = form.watch('position') || '';
    const watchOrgName = form.watch('organizationName') || '';
    const watchDescription = form.watch('description') || '';

    const isAtLimit = activities.length >= MAX_ACTIVITIES;

    const onSubmit = (data: ActivityFormData) => {
        if (editingId) {
            setActivities((prev) =>
                prev.map((a) => (a.id === editingId ? { ...data, id: editingId } : a))
            );
        } else {
            const newActivity: Activity = {
                ...data,
                id: crypto.randomUUID(),
            };
            setActivities((prev) => [...prev, newActivity]);
        }
        form.reset();
        setEditingId(null);
        setDialogOpen(false);
    };

    const deleteActivity = (id: string) => {
        setActivities((prev) => prev.filter((a) => a.id !== id));
    };

    // ─── Drag & Drop ─────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setActivities((prev) => {
                const oldIndex = prev.findIndex((a) => a.id === active.id);
                const newIndex = prev.findIndex((a) => a.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const openEditDialog = (activity: Activity) => {
        setEditingId(activity.id);
        form.reset({
            activityType: activity.activityType,
            position: activity.position,
            organizationName: activity.organizationName,
            description: activity.description,
            gradeLevels: activity.gradeLevels,
            timing: activity.timing,
            hoursPerWeek: activity.hoursPerWeek,
            weeksPerYear: activity.weeksPerYear,
            futureIntent: activity.futureIntent,
        });
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            form.reset();
            setEditingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Activities</h2>
                    <p className="text-sm text-muted-foreground">
                        Add your extracurricular activities ({activities.length}/{MAX_ACTIVITIES})
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                            disabled={isAtLimit}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Edit Activity' : 'Add Activity'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Activity Type */}
                                <FormField
                                    control={form.control}
                                    name="activityType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Activity Type <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select activity type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-60">
                                                    {ACTIVITY_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Position */}
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Position / Leadership Description <span className="text-red-500">*</span></FormLabel>
                                                <CharacterCounter current={watchPosition.length} max={50} />
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Team Captain, President"
                                                    maxLength={50}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Organization Name */}
                                <FormField
                                    control={form.control}
                                    name="organizationName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Organization Name <span className="text-red-500">*</span></FormLabel>
                                                <CharacterCounter current={watchOrgName.length} max={100} />
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Varsity Soccer Team"
                                                    maxLength={100}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Please describe this activity <span className="text-red-500">*</span></FormLabel>
                                                <CharacterCounter current={watchDescription.length} max={150} />
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your role and accomplishments..."
                                                    maxLength={150}
                                                    rows={3}
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
                                            <FormLabel>Participation Grade Levels <span className="text-red-500">*</span></FormLabel>
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

                                {/* Timing */}
                                <FormField
                                    control={form.control}
                                    name="timing"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Timing of Participation <span className="text-red-500">*</span></FormLabel>
                                            <div className="flex flex-wrap gap-4 mt-2">
                                                {TIMING_OPTIONS.map((option) => (
                                                    <FormField
                                                        key={option}
                                                        control={form.control}
                                                        name="timing"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(option)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...current, option]);
                                                                            } else {
                                                                                field.onChange(current.filter((v) => v !== option));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <Label className="text-sm font-normal cursor-pointer">
                                                                    {option}
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

                                {/* Time Commitment */}
                                <div className="space-y-2">
                                    <FormLabel>Time Commitment <span className="text-red-500">*</span></FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="hoursPerWeek"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={168}
                                                                placeholder="Hours"
                                                                {...field}
                                                            />
                                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                                hrs/week
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="weeksPerYear"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={52}
                                                                placeholder="Weeks"
                                                                {...field}
                                                            />
                                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                                wks/year
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Future Intent */}
                                <FormField
                                    control={form.control}
                                    name="futureIntent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                I intend to participate in a similar activity in college. <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex gap-6 mt-2"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id="future-yes" />
                                                        <Label htmlFor="future-yes" className="font-normal cursor-pointer">
                                                            Yes
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id="future-no" />
                                                        <Label htmlFor="future-no" className="font-normal cursor-pointer">
                                                            No
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
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
                                        {editingId ? 'Save Changes' : 'Add Activity'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No activities added yet
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add your first activity
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Activities List */}
            {activities.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={activities.map((a) => a.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {activities.map((activity, index) => (
                                <SortableActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    index={index}
                                    onEdit={openEditDialog}
                                    onDelete={deleteActivity}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Limit Warning */}
            {isAtLimit && (
                <p className="text-sm text-center text-muted-foreground">
                    You&apos;ve reached the maximum of {MAX_ACTIVITIES} activities.
                </p>
            )}
        </div>
    );
}
