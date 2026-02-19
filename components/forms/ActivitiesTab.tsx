'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Pencil } from 'lucide-react';
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    FormDescription
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
import { useProfileData, type Activity } from '@/lib/profileStore';

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
    status: z.enum(['draft', 'ready']),
    appearOnProfile: z.boolean().default(false),
});

type ActivityFormData = z.infer<typeof activitySchema>;

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
            className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-1"
            onClick={() => onEdit(activity)}
        >
            <CardHeader className="py-3 px-4 pb-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
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
                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{activity.position}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit/Delete Actions - Visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); onEdit(activity); }}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Status Badge */}
                        {activity.status === 'ready' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-sm px-3 py-1">Ready</Badge>
                        ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-300 text-sm px-3 py-1">Draft</Badge>
                        )}

                        {/* Visibility Badge */}
                        {activity.appearOnProfile ? (
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
                <div className="flex flex-col gap-1 ml-8"> {/* Indent to align with title next to grip */}
                    <div className="flex items-center gap-2 text-lg text-gray-600 font-medium">
                        <span className="text-[#C26E26]">{activity.organizationName}</span>
                        <span>•</span>
                        <span>{activity.activityType}</span>
                    </div>
                    <p className="text-gray-600 text-lg line-clamp-2 mt-1">{activity.description}</p>

                    <div className="flex items-center gap-3 mt-3">
                        {activity.gradeLevels.length > 0 && (
                            <span className="bg-blue-50 px-3 py-1.5 rounded border border-blue-100 font-medium text-sm text-blue-700">
                                Grades: {activity.gradeLevels.join(', ')}
                            </span>
                        )}
                        <span className="bg-green-50 px-3 py-1.5 rounded border border-green-100 font-medium text-sm text-green-700">
                            {activity.hoursPerWeek} hrs/wk, {activity.weeksPerYear} wks/yr
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ActivitiesTab() {
    const { data: profileData, setActivities: updateStoreActivities } = useProfileData();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<ActivityFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(activitySchema) as any,
        defaultValues: {
            status: 'draft',
            appearOnProfile: false,
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

    // Sync from store on load
    useEffect(() => {
        if (profileData.activities) {
            setActivities(profileData.activities);
        }
    }, [profileData.activities]);

    const updateActivities = (newActivities: Activity[]) => {
        setActivities(newActivities);
        updateStoreActivities(newActivities);
    };

    const onSubmit = (data: ActivityFormData) => {
        let newActivities: Activity[];
        if (editingId) {
            newActivities = activities.map((a) => (a.id === editingId ? { ...data, id: editingId } : a));
        } else {
            const newActivity: Activity = {
                ...data,
                id: crypto.randomUUID(),
            };
            newActivities = [...activities, newActivity];
        }
        updateActivities(newActivities);
        form.reset();
        setEditingId(null);
        setDialogOpen(false);
    };

    const deleteActivity = (id: string) => {
        const newActivities = activities.filter((a) => a.id !== id);
        updateActivities(newActivities);
    };

    // ─── Drag & Drop ─────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = activities.findIndex((a) => a.id === active.id);
            const newIndex = activities.findIndex((a) => a.id === over.id);
            const newActivities = arrayMove(activities, oldIndex, newIndex);
            updateActivities(newActivities);
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
            futureIntent: activity.futureIntent as 'yes' | 'no',
            status: activity.status || 'draft',
            appearOnProfile: activity.appearOnProfile || false,
        });
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            form.reset({
                status: 'draft',
                appearOnProfile: false,
                // reset others to empty to avoid uncontrolled/controlled warnings if needed
            });
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
                        <div className="space-y-4"> {/* Increased spacing */}
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
