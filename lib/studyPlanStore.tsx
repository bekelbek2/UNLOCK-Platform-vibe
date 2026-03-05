import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface StudyPlanSession {
    id: string;
    name: string;
    hours: number;
    price: number;
    category: string;
}

export interface StudyPlanXSession {
    id: string;
    name: string;
    hours: number;
}

export interface StudyPlan {
    id: string;
    studentId: string;
    studentName: string;
    studentStats: {
        grade: string;
        ielts?: string;
        sat?: string;
        targetMajor?: string;
    };
    programType: string;
    programName: string;
    mentors: { role: string; mentorName: string }[];
    resolvedSessions: StudyPlanSession[];
    xSessions: StudyPlanXSession[];
    totalHours: number;
    totalPrice: number;
    status: 'New' | 'In Progress' | 'Completed';
    createdAt: string;
}

interface StudyPlanState {
    studyPlans: StudyPlan[];
    addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'status'>) => void;
    updateStudyPlanStatus: (id: string, status: StudyPlan['status']) => void;
    deleteStudyPlan: (id: string) => void;
}

export const useStudyPlanStore = create<StudyPlanState>()(
    persist(
        (set) => ({
            studyPlans: [],

            addStudyPlan: (plan) =>
                set((state) => ({
                    studyPlans: [
                        {
                            ...plan,
                            id: crypto.randomUUID(),
                            status: 'New',
                            createdAt: new Date().toISOString(),
                        },
                        ...state.studyPlans,
                    ],
                })),

            updateStudyPlanStatus: (id, status) =>
                set((state) => ({
                    studyPlans: state.studyPlans.map((p) =>
                        p.id === id ? { ...p, status } : p
                    ),
                })),

            deleteStudyPlan: (id) =>
                set((state) => ({
                    studyPlans: state.studyPlans.filter((p) => p.id !== id),
                })),
        }),
        {
            name: 'unlock-study-plans-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
