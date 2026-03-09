'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { type User } from '@/lib/authStore';
import { useSystemStore } from '@/lib/systemStore';
import { useStudyPlanStore } from '@/lib/studyPlanStore';
import { useProgramStore, type Lesson } from '@/lib/programStore';
import { useUniversityStore } from '@/lib/universityStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Plus, Trash2, User as UserIcon, BookOpen, Layers, Target, CheckCircle2, DollarSign, Clock, Shield, PenTool, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const xSessionSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Session name required'),
    hours: z.number().min(0.5, 'Min 0.5 hours').max(2, 'Max 2 hours per X-Session'),
});

const formSchema = z.object({
    studentId: z.string().min(1, 'Please select a student'),
    studentName: z.string(),
    studentStats: z.object({
        grade: z.string(),
        ielts: z.string(),
        sat: z.string(),
        targetMajor: z.string(),
    }),
    programType: z.string().min(1, 'Please select a program'),
    assignedMentors: z.any().optional(),
    selectedSessions: z.array(z.string()),
    xSessions: z.array(xSessionSchema),
    targets: z.array(z.object({
        universityId: z.string().min(1, 'Required'),
        universityName: z.string(),
        programId: z.string(),
        programName: z.string().min(1, 'Required')
    })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentOption extends User {
    country?: string | null;
    intended_major?: string | null;
    sat_score?: string | null;
    ielts_score?: string | null;
    toefl_score?: string | null;
    grades?: string | null;
    high_school_curriculum?: string | null;
}

export default function EditStudyPlanPage() {
    const router = useRouter();
    const params = useParams();
    const planId = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
    const [studentSearch, setStudentSearch] = useState('');

    const { studyPlans, updateStudyPlan } = useStudyPlanStore();
    const existingPlan = useMemo(() => studyPlans.find(p => p.id === planId), [studyPlans, planId]);

    // ─── Program Store ───────────────────────────────────────────────────────
    const { programs, lessons: allLessons } = useProgramStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: '',
            studentName: '',
            studentStats: { grade: '', ielts: '', sat: '', targetMajor: '' },
            programType: '',
            assignedMentors: {},
            selectedSessions: [],
            xSessions: [],
            targets: [],
        },
    });

    const { control, handleSubmit, watch, setValue } = form;
    const { fields: xSessionFields, append: addXSession, remove: removeXSession } = useFieldArray({ control, name: 'xSessions' });
    const { fields: targetFields, append: addTarget, remove: removeTarget } = useFieldArray({ control, name: 'targets' });

    const programType = watch('programType');
    const selectedSessions = watch('selectedSessions');
    const assignedMentorsDict = watch('assignedMentors');

    const { users } = useSystemStore();
    const { universities } = useUniversityStore();

    // Derived grouped institutions
    const groupedInstitutions = useMemo(() => {
        return {
            universities: universities.filter(u => u.type === 'university'),
            programs: universities.filter(u => u.type === 'program'),
        };
    }, [universities]);

    // Derive students and mentors
    const mentors = useMemo(() => users.filter(u => u.role === 'admin'), [users]);

    useEffect(() => {
        setStudents(users.filter(u => u.role === 'student') as StudentOption[]);
    }, [users]);

    // ─── Populate Existing Data ───────────────────────────────────────────────
    useEffect(() => {
        if (existingPlan && students.length > 0) {
            const student = students.find((s) => s.id === existingPlan.studentId);
            if (student) setSelectedStudent(student);

            // Reconstruct assignedMentors object from array
            const mentorsObj: Record<string, string> = {};
            existingPlan.mentors.forEach(m => {
                const mentorFound = mentors.find(admin => admin.full_name === m.mentorName);
                if (mentorFound) mentorsObj[m.role] = mentorFound.id;
            });

            form.reset({
                studentId: existingPlan.studentId,
                studentName: existingPlan.studentName,
                studentStats: existingPlan.studentStats,
                programType: existingPlan.programType,
                assignedMentors: mentorsObj,
                selectedSessions: existingPlan.resolvedSessions.map(s => s.id),
                xSessions: existingPlan.xSessions,
                targets: existingPlan.targets || [],
            });
        }
    }, [existingPlan, students, mentors, form]);

    // ─── Program-derived data ────────────────────────────────────────────────
    const selectedProgram = programs.find(p => p.id === programType);
    const programLessons = useMemo(
        () => allLessons.filter(l => l.programId === programType),
        [allLessons, programType]
    );

    const isFlexibleProgram = selectedProgram?.slug === 'ambulance';

    // Only non-flexible lessons go into the curriculum cards for standard programs.
    // For Ambulance, all lessons are shown so the admin can pick which ones to include.
    const curriculumLessons = useMemo(
        () => isFlexibleProgram ? programLessons : programLessons.filter(l => !l.isFlexible),
        [programLessons, isFlexibleProgram]
    );

    // Group lessons by category
    const categorizedLessons = useMemo(() => {
        const catMap = new Map<string, Lesson[]>();
        for (const l of curriculumLessons) {
            const arr = catMap.get(l.category) || [];
            arr.push(l);
            catMap.set(l.category, arr);
        }
        return Array.from(catMap.entries());
    }, [curriculumLessons]);

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const q = studentSearch.toLowerCase();
        return students.filter(
            (s) =>
                s.full_name?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q)
        );
    }, [students, studentSearch]);

    // ─── Price & Hours calculation ───────────────────────────────────────────
    const { totalHours, totalPrice } = useMemo(() => {
        let hours = 0;
        let price = 0;

        // Count lessons that are selected in the curriculum
        for (const lesson of curriculumLessons) {
            if (isFlexibleProgram) {
                // Ambulance: only count checked sessions
                if (selectedSessions.includes(lesson.id)) {
                    hours += lesson.hours;
                    price += lesson.price;
                }
            } else {
                // 360 / Powder: all curriculum lessons are mandatory
                hours += lesson.hours;
                price += lesson.price;
            }
        }

        // X-Sessions hours (custom, admin-typed)
        const xSessions = form.getValues('xSessions') || [];
        for (const xs of xSessions) {
            hours += xs.hours || 0;
        }

        return { totalHours: hours, totalPrice: price };
    }, [curriculumLessons, selectedSessions, isFlexibleProgram, form]);

    // When a student is selected, auto-fill form fields
    const handleStudentSelect = (studentId: string) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        setSelectedStudent(student);
        setValue('studentId', student.id);
        setValue('studentName', student.full_name ?? '');
        setValue('studentStats.grade', student.grades ?? '');
        setValue('studentStats.targetMajor', student.intended_major ?? '');
        setValue('studentStats.sat', student.sat_score ?? '');
        setValue('studentStats.ielts', student.ielts_score ?? student.toefl_score ?? '');
    };

    // When program changes, auto-select appropriate sessions
    useEffect(() => {
        if (!programType) return;

        let sessionIds: string[] = [];

        if (existingPlan && programType === existingPlan.programType) {
            // If the user hasn't changed the program from the original one,
            // preserve the previously selected sessions.
            sessionIds = existingPlan.resolvedSessions.map(s => s.id);
        } else {
            // For non-flexible programs, all non-flexible lessons are automatically selected.
            // For flexible programs, nothing is pre-selected.
            sessionIds = isFlexibleProgram ? [] : curriculumLessons.map(l => l.id);
        }

        setValue('selectedSessions', sessionIds, { shouldValidate: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programType, isFlexibleProgram, existingPlan, curriculumLessons.map(l => l.id).join(',')]);

    const handleSessionToggle = (lessonId: string, checked: boolean) => {
        // Only Ambulance allows toggling — others are locked
        if (!isFlexibleProgram) return;

        let newSelection = [...selectedSessions];
        if (checked) {
            if (!newSelection.includes(lessonId)) newSelection.push(lessonId);
        } else {
            newSelection = newSelection.filter(id => id !== lessonId);
        }
        setValue('selectedSessions', newSelection, { shouldValidate: true });
    };

    const onSubmit = async (data: FormValues) => {
        try {
            console.log('--- ENTERING ONSUBMIT ---');
            setIsSubmitting(true);

            // Validation: Ensure all program mentor roles have been assigned
            if (selectedProgram?.mentorRoles && selectedProgram.mentorRoles.length > 0) {
                const missingRoles = selectedProgram.mentorRoles
                    .map(mr => mr.role)
                    .filter(role => !data.assignedMentors || !data.assignedMentors[role]);

                if (missingRoles.length > 0) {
                    toast.error(`Please assign mentors to the following roles: ${missingRoles.join(', ')}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Build payload with resolved lesson info
            const resolvedSessions = data.selectedSessions.map(id => {
                const lesson = allLessons.find(l => l.id === id);
                return lesson ? { id: lesson.id, name: lesson.name, hours: lesson.hours, price: lesson.price, category: lesson.category } : { id, name: 'Unknown', hours: 0, price: 0, category: '' };
            });

            // Combine structured mentor roles and manual selections
            const assignedMentorsArray = Object.entries(data.assignedMentors || {}).map(([role, mentorId]) => {
                const mentorName = mentors.find(m => m.id === mentorId)?.full_name || 'Unassigned';
                return { role, mentorName };
            }).filter(m => m.mentorName !== 'Unassigned');

            const payload = {
                ...data,
                programName: selectedProgram?.name,
                mentors: assignedMentorsArray,
                resolvedSessions,
                targets: data.targets?.map(t => ({
                    ...t,
                    programId: t.programId || uuidv4() // Assign random ID if not present
                })) || [],
                totalHours,
                totalPrice,
            };

            console.log('--- FINAL STUDY PLAN PAYLOAD ---');
            console.log(JSON.stringify(payload, null, 2));

            // Save to store
            updateStudyPlan(planId, {
                studentId: payload.studentId,
                studentName: payload.studentName,
                studentStats: payload.studentStats,
                programType: payload.programType,
                programName: payload.programName || 'Unknown Program',
                mentors: payload.mentors,
                resolvedSessions: payload.resolvedSessions,
                xSessions: payload.xSessions,
                targets: payload.targets,
                totalHours: payload.totalHours,
                totalPrice: payload.totalPrice,
            });

            toast.success('Study plan updated successfully!');
            setIsSubmitting(false);

            // Redirect back to main list
            router.push('/admin/study-plans');
        } catch (error) {
            console.error('CRITICAL ONSUBMIT ERROR:', error);
            toast.error('Failed to save study plan. Check console.');
            setIsSubmitting(false);
        }
    };

    if (!existingPlan || students.length === 0 || programs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-gray-500 animate-pulse">Loading study plan data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
                <button
                    onClick={() => router.push('/admin/study-plans')}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-[#C26E26] transition-colors mb-4"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Back to Study Plans
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Study Plan</h1>
                <p className="text-gray-500 text-sm mt-1">Modify the student&apos;s curriculum mapping based on UNLOCK guidelines.</p>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8 space-y-8">
                <form id="study-plan-form" onSubmit={handleSubmit(onSubmit, (errors) => { console.error('FORM ERRORS:', errors); toast.error('Form validation failed: ' + Object.keys(errors).join(', ')); })} className="space-y-8">

                    {/* Section 1: Student Selector */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-[#C26E26]" />
                                Student Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Select Student <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="studentId"
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => { field.onChange(val); handleStudentSelect(val); }} value={field.value}>
                                            <SelectTrigger className="border-gray-200 focus:ring-[#C26E26] min-h-16 h-auto py-3 px-5 text-lg">
                                                <SelectValue placeholder="Choose a student..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <Input
                                                        placeholder="Search by name or email..."
                                                        value={studentSearch}
                                                        onChange={(e) => setStudentSearch(e.target.value)}
                                                        className="h-9 text-sm border-gray-200"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                {filteredStudents.length === 0 ? (
                                                    <div className="px-4 py-5 text-sm text-gray-400 text-center">No students found</div>
                                                ) : (
                                                    filteredStudents.map((s) => (
                                                        <SelectItem key={s.id} value={s.id} className="py-3 px-4">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="font-medium">{s.full_name || 'Unnamed'}</span>
                                                                <span className="text-xs text-gray-400">{s.email} · {s.country || 'No country'}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {form.formState.errors.studentId && <p className="text-xs text-red-500 mt-1">{form.formState.errors.studentId.message}</p>}
                            </div>

                            {/* Auto-filled Student Details */}
                            {selectedStudent && (
                                <div className="rounded-xl border border-[#C26E26]/20 bg-[#FFF8F0] p-5 space-y-4">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-10 h-10 rounded-full bg-[#C26E26]/10 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-[#C26E26]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedStudent.full_name}</p>
                                            <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Country</p>
                                            <p className="text-sm font-medium text-gray-800">{selectedStudent.country || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Target Major</p>
                                            <p className="text-sm font-medium text-gray-800">{selectedStudent.intended_major || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">SAT Score</p>
                                            <p className="text-sm font-medium text-gray-800">{selectedStudent.sat_score || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">IELTS / TOEFL</p>
                                            <p className="text-sm font-medium text-gray-800">{selectedStudent.ielts_score || selectedStudent.toefl_score || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 1.5: Default Universities/Programs */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-[#C26E26]" />
                                    Default Universities/Programs
                                </CardTitle>
                                <CardDescription className="mt-1">Link the institutions and specific programs this student is aiming for.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTarget({ universityId: '', universityName: '', programId: '', programName: '' })}
                                className="h-8 gap-1.5 border-gray-200 text-gray-800"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add University/Program
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            {targetFields.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm">No default universities/programs added yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {targetFields.map((field, index) => (
                                        <div key={field.id} className="relative p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1 space-y-2 w-full md:w-1/2">
                                                <Label className="text-xs text-gray-500">Universities / Summer Programs</Label>
                                                <Controller
                                                    control={control}
                                                    name={`targets.${index}.universityId`}
                                                    render={({ field: f }) => (
                                                        <Select
                                                            onValueChange={(val) => {
                                                                f.onChange(val);
                                                                const inst = universities.find(u => u.id === val);
                                                                if (inst) setValue(`targets.${index}.universityName`, inst.name);
                                                            }}
                                                            value={f.value}
                                                        >
                                                            <SelectTrigger className="focus:ring-[#C26E26]">
                                                                <SelectValue placeholder="Select an institution..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groupedInstitutions.universities.length > 0 && (
                                                                    <SelectGroup>
                                                                        <SelectLabel>Universities</SelectLabel>
                                                                        {groupedInstitutions.universities.map(uni => (
                                                                            <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                )}
                                                                {groupedInstitutions.universities.length > 0 && groupedInstitutions.programs.length > 0 && (
                                                                    <SelectSeparator />
                                                                )}
                                                                {groupedInstitutions.programs.length > 0 && (
                                                                    <SelectGroup>
                                                                        <SelectLabel>Summer Programs</SelectLabel>
                                                                        {groupedInstitutions.programs.map(prog => (
                                                                            <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {form.formState.errors.targets?.[index]?.universityId && (
                                                    <p className="text-[10px] text-red-500">{form.formState.errors.targets[index]?.universityId?.message}</p>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 w-full md:w-1/2">
                                                <Label className="text-xs text-gray-500">Target Major / Program</Label>
                                                <Input {...form.register(`targets.${index}.programName`)} placeholder="e.g. B.S. in Computer Science" className="h-9 focus-visible:ring-[#C26E26]" />
                                                {form.formState.errors.targets?.[index]?.programName && (
                                                    <p className="text-[10px] text-red-500">{form.formState.errors.targets[index]?.programName?.message}</p>
                                                )}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTarget(index)}
                                                className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 mt-6 md:mt-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 2: Program Selection */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[#C26E26]" />
                                Program Type
                            </CardTitle>
                            <CardDescription>Select the core framework. Curricula, hours, and pricing are fetched from the Programs store.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {programs.map((prog) => {
                                    const pLessons = allLessons.filter(l => l.programId === prog.id);
                                    const pHours = pLessons.reduce((s, l) => s + l.hours, 0);
                                    const pPrice = pLessons.reduce((s, l) => s + l.price, 0);
                                    const isSelected = programType === prog.id;

                                    return (
                                        <label
                                            key={prog.id}
                                            className={`relative flex cursor-pointer rounded-xl border p-5 shadow-sm focus:outline-none transition-all ${isSelected
                                                ? 'border-[#C26E26] bg-orange-50/50 ring-1 ring-[#C26E26]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="programTypeRadio"
                                                value={prog.id}
                                                checked={isSelected}
                                                onChange={() => setValue('programType', prog.id)}
                                                className="sr-only"
                                            />
                                            <div className="flex flex-col w-full">
                                                <span className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {prog.name}
                                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C26E26]" />}
                                                </span>
                                                <span className="text-xs text-gray-500 mt-1">{prog.description}</span>
                                                <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{pLessons.length} lessons</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pHours.toFixed(1)}h</span>
                                                    {pPrice > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${pPrice}</span>}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Mentor Assignment */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#C26E26]" />
                                Mentor Assignment
                            </CardTitle>
                            <CardDescription>
                                {selectedProgram?.mentorRoles && selectedProgram.mentorRoles.length > 0
                                    ? `Mentors for ${selectedProgram.name} are predefined in Program Settings.`
                                    : 'Assign one mentor for strategic guidance and one for essay support.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {selectedProgram?.mentorRoles && selectedProgram.mentorRoles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {selectedProgram.mentorRoles.map((mr) => {
                                        const selectedMentorId = assignedMentorsDict ? assignedMentorsDict[mr.role] : undefined;
                                        const mentor = mentors.find(m => m.id === selectedMentorId);
                                        return (
                                            <div key={mr.role} className="space-y-3">
                                                <Label className="text-gray-700 font-medium flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-[#C26E26]" />
                                                    {mr.role}
                                                </Label>
                                                <Controller
                                                    control={control}
                                                    name={`assignedMentors.${mr.role}`}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={typeof field.value === 'string' ? field.value : undefined}>
                                                            <SelectTrigger className="border-gray-200 focus:ring-[#C26E26]">
                                                                <SelectValue placeholder="Select a mentor..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mentors.map((m) => (
                                                                    <SelectItem key={m.id} value={m.id} className="py-2.5 px-3">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-medium">{m.full_name}</span>
                                                                            <span className="text-xs text-gray-400">{m.email}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {mentor && (
                                                    <div className="rounded-lg border border-orange-100 bg-orange-50/40 p-3 flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                            <UserIcon className="w-4 h-4 text-orange-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{mentor.full_name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{mentor.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm">Please select a program first to assign mentors.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section 4: Dynamic Curriculum from Program Store */}
                    {programType && categorizedLessons.length > 0 && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {categorizedLessons.map(([category, catLessons]) => {
                                const catColors: Record<string, { icon: string; bg: string; check: string }> = {
                                    'Strategic': { icon: 'text-indigo-600', bg: 'bg-indigo-50/30', check: 'text-indigo-600' },
                                    'Writing': { icon: 'text-emerald-600', bg: 'bg-emerald-50/40', check: 'text-emerald-600' },
                                    'Group Session': { icon: 'text-violet-600', bg: 'bg-violet-50/30', check: 'text-violet-600' },
                                    'Individual Consultation': { icon: 'text-blue-600', bg: 'bg-blue-50/30', check: 'text-blue-600' },
                                };
                                const colors = catColors[category] || { icon: 'text-gray-600', bg: 'bg-gray-50/30', check: 'text-gray-600' };
                                const CatIcon = category === 'Writing' ? Layers : Target;

                                return (
                                    <Card key={category} className="shadow-sm border-gray-200 overflow-hidden h-full flex flex-col">
                                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CatIcon className={`w-5 h-5 ${colors.icon}`} />
                                                {category}
                                                <Badge variant="secondary" className="text-xs ml-auto">{catLessons.length}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-1">
                                            <ul className="divide-y divide-gray-100">
                                                {catLessons.map((lesson) => {
                                                    const isChecked = selectedSessions.includes(lesson.id);
                                                    const isLocked = !isFlexibleProgram && !lesson.isFlexible;

                                                    return (
                                                        <li key={lesson.id} className={`py-2.5 px-4 flex items-start gap-4 transition-colors ${isChecked ? colors.bg : 'hover:bg-gray-50'}`}>
                                                            <div className="mt-1">
                                                                {isLocked ? (
                                                                    <CheckCircle2 className={`w-5 h-5 ${colors.check}`} />
                                                                ) : (
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={(c) => handleSessionToggle(lesson.id, !!c)}
                                                                        className={`data-[state=checked]:bg-[#C26E26] data-[state=checked]:border-[#C26E26]`}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-50">
                                                                        {lesson.division}
                                                                    </Badge>
                                                                    <span className="text-xs text-gray-400 font-medium">~{lesson.hours}h</span>
                                                                    {lesson.price > 0 && <span className="text-xs text-emerald-600 font-semibold">${lesson.price}</span>}
                                                                    {lesson.isFlexible && (
                                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] px-1.5 py-0">Flex</Badge>
                                                                    )}
                                                                </div>
                                                                <p className={`text-sm font-medium ${isChecked ? 'text-gray-900' : 'text-gray-500'} ${isLocked && 'cursor-default'}`}>
                                                                    {lesson.name}
                                                                </p>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Section 4: Add Custom X-Session (Flexible) */}
                    {programType && (
                        <Card className="shadow-sm border-gray-200 overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-gray-600" />
                                        Custom X-Sessions
                                    </CardTitle>
                                    <CardDescription className="mt-1">Add flexible, ad-hoc sessions outside the core curriculum (Max 2 hrs/session).</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addXSession({ id: uuidv4(), name: '', hours: 1 })}
                                    className="h-8 gap-1.5 border-gray-200 text-gray-800"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add X-Session
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                {xSessionFields.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Separator className="w-16 mx-auto mb-4" />
                                        <p className="text-gray-500 text-sm">No custom X-Sessions added yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {xSessionFields.map((field, index) => (
                                            <div key={field.id} className="relative p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                <div className="flex-1 space-y-2 w-full">
                                                    <Label className="text-xs text-gray-500">Session Name</Label>
                                                    <Input {...form.register(`xSessions.${index}.name`)} placeholder="e.g. Extra Interview Prep" className="h-9 focus-visible:ring-[#C26E26]" />
                                                    {form.formState.errors.xSessions?.[index]?.name && (
                                                        <p className="text-[10px] text-red-500">{form.formState.errors.xSessions[index]?.name?.message}</p>
                                                    )}
                                                </div>

                                                <div className="w-full md:w-32 space-y-2">
                                                    <Label className="text-xs text-gray-500">Hours</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.5"
                                                        {...form.register(`xSessions.${index}.hours`, { valueAsNumber: true })}
                                                        className="h-9 focus-visible:ring-[#C26E26]"
                                                    />
                                                    {form.formState.errors.xSessions?.[index]?.hours && (
                                                        <p className="text-[10px] text-red-500 font-medium leading-tight">
                                                            {form.formState.errors.xSessions[index]?.hours?.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeXSession(index)}
                                                    className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 mt-6 md:mt-0"
                                                    title="Remove X-Session"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                </form>
            </main>

            {/* Sticky Pricing/Save Footer */}
            <div className="fixed bottom-0 left-[280px] right-0 border-t border-gray-200 bg-white/80 backdrop-blur-md p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-8">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {selectedProgram ? selectedProgram.name : 'Select a program'}
                        </p>
                        <div className="flex items-center gap-4 mt-0.5">
                            <span className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                ${totalPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {totalHours.toFixed(1)} hours
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                                · {selectedSessions.length} sessions
                            </span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        form="study-plan-form"
                        className="bg-[#C26E26] hover:bg-[#a65d1f] text-white h-12 px-8 font-semibold shadow-sm text-base"
                        disabled={isSubmitting || !programType}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
