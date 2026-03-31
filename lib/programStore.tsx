'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from './generateId';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Lesson {
    id: string;
    programId: string;
    category: string;      // e.g. 'Group Session', 'Strategic', 'Writing', 'Individual'
    division: string;      // sub-group within category
    name: string;
    hours: number;
    price: number;
    isFlexible: boolean;   // true = only added per-student during study plan creation
}

export interface Program {
    id: string;
    name: string;
    slug: string;
    description: string;
    mentorRoles: { role: string; mentorId: string }[];  // e.g. Powder has 4 fixed roles
}

export interface ProgramState {
    programs: Program[];
    lessons: Lesson[];
    addProgram: (program: Omit<Program, 'id'>) => void;
    updateProgram: (id: string, updates: Partial<Program>) => void;
    deleteProgram: (id: string) => void;
    addLesson: (lesson: Omit<Lesson, 'id'>) => void;
    updateLesson: (id: string, updates: Partial<Lesson>) => void;
    deleteLesson: (id: string) => void;
    getLessonsByProgram: (programId: string) => Lesson[];
    getTotalHours: (programId: string) => number;
    getTotalPrice: (programId: string) => number;
}

// ─── Seed Data: Programs ─────────────────────────────────────────────────────
const SEED_PROGRAMS: Program[] = [
    {
        id: 'prog-powder',
        name: 'Powder Group Program',
        slug: 'powder-group',
        description: 'Group-based preparatory program with structured lessons and individual consultations.',
        mentorRoles: [
            { role: 'Academics', mentorId: '' },
            { role: 'ECs', mentorId: '' },
            { role: 'Writing', mentorId: '' },
            { role: 'Admissions', mentorId: '' },
        ],
    },
    {
        id: 'prog-360',
        name: '360° Full Support',
        slug: '360-full-support',
        description: 'Comprehensive one-on-one program covering strategy, writing, and university-specific preparation.',
        mentorRoles: [],
    },
    {
        id: 'prog-ambulance',
        name: 'Ambulance (Flexible Full-Support)',
        slug: 'ambulance',
        description: 'Fully flexible program — pick only the sessions you need. Price calculated from selected lessons.',
        mentorRoles: [],
    },
];

// ─── Seed Data: Powder Group Lessons ─────────────────────────────────────────
const POWDER_LESSONS: Omit<Lesson, 'id'>[] = [
    // Group Sessions
    { programId: 'prog-powder', category: 'Group Session', division: 'Introduction', name: 'Introduction to the Powder', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Academics', name: 'Academics: In School', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Academics', name: 'Academics: Beyond School', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Academics', name: 'Ideal Academic Profile', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Profile', name: 'Interest, YOU, and Admissions', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Extracurriculars', name: 'ECs Doing', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Extracurriculars', name: 'ECs Describing/Writing', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 1', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 2', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 3', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 4', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 5', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 6', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 7', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 8', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 9', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Writing', name: 'Writing 10', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Interview', name: 'Interview', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'USA', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'Europe', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'Canada and Australia', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'Asia', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'Middle East', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Destinations', name: 'UK and Europe', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Strategy', name: 'College List', hours: 2, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Group Session', division: 'Closing', name: 'Failure Plan and Thank You', hours: 2, price: 0, isFlexible: false },
    // Individual Consultations (20)
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Academic Review', name: 'Academic Profile Deep-Dive', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Academic Review', name: 'Course Selection Strategy', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Academic Review', name: 'GPA & Transcript Review', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Test Prep', name: 'SAT/ACT Score Strategy', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Test Prep', name: 'IELTS/TOEFL Preparation Plan', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Profile Building', name: 'Extracurricular Audit', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Profile Building', name: 'Leadership Narrative Development', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Profile Building', name: 'Summer Program Selection', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Profile Building', name: 'Research & Projects Guidance', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'University Selection', name: 'University Shortlisting', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'University Selection', name: 'Reach / Match / Safety Calibration', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'University Selection', name: 'Financial Aid & Scholarship Strategy', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Essays', name: 'Personal Statement Brainstorm', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Essays', name: 'Personal Statement First Draft Review', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Essays', name: 'Supplemental Essay Strategy', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Essays', name: 'Supplemental Essay Review', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Application', name: 'Common App Walkthrough', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Application', name: 'Recommendation Letter Strategy', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Application', name: 'Interview Mock Session', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-powder', category: 'Individual Consultation', division: 'Application', name: 'Final Application Review & Submit', hours: 1, price: 0, isFlexible: false },
];

// ─── Seed Data: 360° Full Support Lessons ────────────────────────────────────
const FULL_SUPPORT_LESSONS: Omit<Lesson, 'id'>[] = [
    // Strategic Sessions
    { programId: 'prog-360', category: 'Strategic', division: 'Profile', name: 'Two Concepts (Curious & Successful)', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'Academics', name: 'Academic Planning & Goals', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'ECs & Honors', name: 'Extracurricular Planning & Goals', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'University List', name: 'University List & Filtering', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'RL', name: 'RL Planning & Outline', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'Finance', name: 'Financial Documentation & Context', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'Profile', name: 'Application File (Common App; Other)', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Strategic', division: 'Flexible', name: 'X Session — Emergency / Q&A', hours: 1, price: 0, isFlexible: true },
    { programId: 'prog-360', category: 'Strategic', division: 'U+1 (University)', name: 'Application Portal Review', hours: 1, price: 0, isFlexible: true },
    { programId: 'prog-360', category: 'Strategic', division: 'U+1 (University)', name: 'Y Session — University Q&A', hours: 0.33, price: 0, isFlexible: true },
    // Writing Sessions
    { programId: 'prog-360', category: 'Writing', division: 'Overall', name: 'Workshop on Personal Statement', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Topic Proposal', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Structuring', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Drafting + Improving', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Drafting + Improving (2)', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Drafting + Finalizing', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Personal Statement', name: 'Final Polish', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Mini Essays', name: 'Writing Activity & Honor Descriptions', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Mini Essays', name: 'Gap Year Essay & School Change & Additional Info', hours: 1, price: 0, isFlexible: false },
    { programId: 'prog-360', category: 'Writing', division: 'Flexible', name: 'Flexible Writing Session', hours: 1, price: 0, isFlexible: true },
    { programId: 'prog-360', category: 'Writing', division: 'Supplementals', name: 'Brainstorming for X University', hours: 1, price: 0, isFlexible: true },
    { programId: 'prog-360', category: 'Writing', division: 'Supplementals', name: 'Writing & Review for X University', hours: 1, price: 0, isFlexible: true },
    { programId: 'prog-360', category: 'Writing', division: 'Flexible', name: 'Flexible Writing Q&A', hours: 1, price: 0, isFlexible: true },
];

// ─── Seed Data: Ambulance — starts empty, fully flexible ─────────────────────
// Ambulance shares the same session catalogue as 360° but every session is
// optional (isFlexible: true). Admins can add/remove sessions for the template.
const AMBULANCE_LESSONS: Omit<Lesson, 'id'>[] = FULL_SUPPORT_LESSONS.map(l => ({
    ...l,
    programId: 'prog-ambulance',
    isFlexible: true,
}));

// ─── Helper: generate IDs ────────────────────────────────────────────────────
let _counter = 0;
function seedId(prefix: string): string {
    _counter++;
    return `${prefix}-${String(_counter).padStart(3, '0')}`;
}

const ALL_SEED_LESSONS: Lesson[] = [
    ...POWDER_LESSONS.map(l => ({ ...l, id: seedId('pw') })),
    ...FULL_SUPPORT_LESSONS.map(l => ({ ...l, id: seedId('fs') })),
    ...AMBULANCE_LESSONS.map(l => ({ ...l, id: seedId('am') })),
];

// ─── Store ───────────────────────────────────────────────────────────────────
export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            programs: SEED_PROGRAMS,
            lessons: ALL_SEED_LESSONS,

            addProgram: (program) =>
                set((state) => ({
                    programs: [
                        ...state.programs,
                        { ...program, id: generateId() },
                    ],
                })),

            updateProgram: (id, updates) =>
                set((state) => ({
                    programs: state.programs.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),

            deleteProgram: (id) =>
                set((state) => ({
                    programs: state.programs.filter((p) => p.id !== id),
                    lessons: state.lessons.filter((l) => l.programId !== id),
                })),

            addLesson: (lesson) =>
                set((state) => ({
                    lessons: [
                        ...state.lessons,
                        { ...lesson, id: generateId() },
                    ],
                })),

            updateLesson: (id, updates) =>
                set((state) => ({
                    lessons: state.lessons.map((l) =>
                        l.id === id ? { ...l, ...updates } : l
                    ),
                })),

            deleteLesson: (id) =>
                set((state) => ({
                    lessons: state.lessons.filter((l) => l.id !== id),
                })),

            getLessonsByProgram: (programId) =>
                get().lessons.filter((l) => l.programId === programId),

            getTotalHours: (programId) =>
                get()
                    .lessons.filter((l) => l.programId === programId)
                    .reduce((sum, l) => sum + l.hours, 0),

            getTotalPrice: (programId) =>
                get()
                    .lessons.filter((l) => l.programId === programId)
                    .reduce((sum, l) => sum + l.price, 0),
        }),
        {
            name: 'unlock-programs-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
