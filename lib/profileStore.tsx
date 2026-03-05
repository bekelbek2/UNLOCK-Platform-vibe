'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Honor {
    id: string;
    title: string;
    gradeLevels: string[];
    recognitionLevels: string[];
    status: 'draft' | 'ready';
    appearOnProfile: boolean;
}

export interface Activity {
    id: string;
    activityType: string;
    position: string;
    organizationName: string;
    description: string;
    gradeLevels: string[];
    timing: string[];
    hoursPerWeek: number;
    weeksPerYear: number;
    futureIntent: string;
    status: 'draft' | 'ready';
    appearOnProfile: boolean;
}

export interface Parent {
    id: string;
    relationship: string;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    educationLevel: string;
    occupation: string;
    employer: string;
    isLiving: 'yes' | 'no';
}

export interface Essay {
    id: string;
    title: string;
    linkedDocumentId: string;
}

export interface Recommendation {
    id: string;
    title: string;
    linkedDocumentId: string;
}

export interface IncomeItem {
    id: string;
    source: string;
    amount: number;
    taxPaid?: number;
    isTaxable?: boolean;
    type: string;
}

export interface AssetItem {
    id: string;
    source: string;
    value: number;
    type: string;
}

export interface OtherExpenseItem {
    id: string;
    source: string;
    amount: number;
}

export interface DebtItem {
    id: string;
    source: string;
    amount: number;
}

export interface StudentData {
    personal: Record<string, unknown>;
    family: Record<string, unknown>;
    education: Record<string, unknown>;
    testScores: Record<string, unknown>[];
    activities: Activity[];
    honors: Honor[];
    finance: {
        incomes: IncomeItem[];
        assets: AssetItem[];
        otherExpenses: OtherExpenseItem[];
        debts: DebtItem[];
        [key: string]: unknown;
    };
    essays: Essay[];
    recommendations: Recommendation[];
}

interface ProfileStoreProps {
    data: StudentData;
    updatePersonal: (personal: Record<string, unknown>) => void;
    updateFamily: (family: Record<string, unknown>) => void;
    updateEducation: (education: Record<string, unknown>) => void;
    setTestScores: (scores: Record<string, unknown>[]) => void;
    setActivities: (activities: Activity[]) => void;
    setHonors: (honors: Honor[]) => void;
    addActivity: (activity: Omit<Activity, 'id'>) => void;
    removeActivity: (id: string) => void;
    updateActivity: (id: string, updates: Partial<Activity>) => void;
    addHonor: (honor: Omit<Honor, 'id'>) => void;
    removeHonor: (id: string) => void;
    updateHonor: (id: string, updates: Partial<Honor>) => void;
    updateFinance: (finance: Record<string, unknown>) => void;
    addIncome: (item: Omit<IncomeItem, 'id'>) => void;
    removeIncome: (id: string) => void;
    addAsset: (item: Omit<AssetItem, 'id'>) => void;
    removeAsset: (id: string) => void;
    addOtherExpense: (item: Omit<OtherExpenseItem, 'id'>) => void;
    removeOtherExpense: (id: string) => void;
    addDebt: (item: Omit<DebtItem, 'id'>) => void;
    removeDebt: (id: string) => void;
    addEssay: (title: string, linkedDocumentId: string) => void;
    removeEssay: (id: string) => void;
    updateEssay: (id: string, updates: Partial<Essay>) => void;
    addRecommendation: (title: string, linkedDocumentId: string) => void;
    removeRecommendation: (id: string) => void;
    addParent: () => void;
    removeParent: (id: string) => void;
    updateParent: (id: string, updates: Partial<Parent>) => void;
}

const defaultData: StudentData = {
    personal: {},
    family: {},
    education: {},
    testScores: [],
    activities: [],
    honors: [],
    finance: { incomes: [], assets: [], otherExpenses: [], debts: [] },
    essays: [],
    recommendations: [],
};

export const useProfileStore = create<ProfileStoreProps>()(
    persist(
        (set) => ({
            data: defaultData,

            updatePersonal: (personal) => set((state) => ({ data: { ...state.data, personal } })),
            updateFamily: (family) => set((state) => ({ data: { ...state.data, family } })),
            updateEducation: (education) => set((state) => ({ data: { ...state.data, education } })),
            setTestScores: (testScores) => set((state) => ({ data: { ...state.data, testScores } })),
            setActivities: (activities) => set((state) => ({ data: { ...state.data, activities } })),
            setHonors: (honors) => set((state) => ({ data: { ...state.data, honors } })),

            addActivity: (activity) => set((state) => ({
                data: { ...state.data, activities: [...state.data.activities, { id: crypto.randomUUID(), ...activity }] }
            })),
            removeActivity: (id) => set((state) => ({
                data: { ...state.data, activities: state.data.activities.filter((a) => a.id !== id) }
            })),
            updateActivity: (id, updates) => set((state) => ({
                data: {
                    ...state.data,
                    activities: state.data.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
                }
            })),

            addHonor: (honor) => set((state) => ({
                data: { ...state.data, honors: [...state.data.honors, { id: crypto.randomUUID(), ...honor }] }
            })),
            removeHonor: (id) => set((state) => ({
                data: { ...state.data, honors: state.data.honors.filter((h) => h.id !== id) }
            })),
            updateHonor: (id, updates) => set((state) => ({
                data: {
                    ...state.data,
                    honors: state.data.honors.map((h) => (h.id === id ? { ...h, ...updates } : h)),
                }
            })),

            updateFinance: (finance) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, ...finance } }
            })),

            addIncome: (item) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, incomes: [...state.data.finance.incomes, { id: crypto.randomUUID(), ...item }] } }
            })),
            removeIncome: (id) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, incomes: state.data.finance.incomes.filter((i) => i.id !== id) } }
            })),

            addAsset: (item) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, assets: [...state.data.finance.assets, { id: crypto.randomUUID(), ...item }] } }
            })),
            removeAsset: (id) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, assets: state.data.finance.assets.filter((i) => i.id !== id) } }
            })),

            addOtherExpense: (item) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, otherExpenses: [...state.data.finance.otherExpenses, { id: crypto.randomUUID(), ...item }] } }
            })),
            removeOtherExpense: (id) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, otherExpenses: state.data.finance.otherExpenses.filter((i) => i.id !== id) } }
            })),

            addDebt: (item) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, debts: [...state.data.finance.debts, { id: crypto.randomUUID(), ...item }] } }
            })),
            removeDebt: (id) => set((state) => ({
                data: { ...state.data, finance: { ...state.data.finance, debts: state.data.finance.debts.filter((i) => i.id !== id) } }
            })),

            addEssay: (title, linkedDocumentId) => set((state) => ({
                data: { ...state.data, essays: [...state.data.essays, { id: crypto.randomUUID(), title, linkedDocumentId }] }
            })),
            removeEssay: (id) => set((state) => ({
                data: { ...state.data, essays: state.data.essays.filter((e) => e.id !== id) }
            })),
            updateEssay: (id, updates) => set((state) => ({
                data: { ...state.data, essays: state.data.essays.map((e) => (e.id === id ? { ...e, ...updates } : e)) }
            })),

            addRecommendation: (title, linkedDocumentId) => set((state) => ({
                data: { ...state.data, recommendations: [...state.data.recommendations, { id: crypto.randomUUID(), title, linkedDocumentId }] }
            })),
            removeRecommendation: (id) => set((state) => ({
                data: { ...state.data, recommendations: state.data.recommendations.filter((r) => r.id !== id) }
            })),

            addParent: () => set((state) => {
                const currentParents = (state.data.family?.parents as Parent[]) || [];
                if (currentParents.length >= 4) return state;
                return {
                    data: {
                        ...state.data,
                        family: {
                            ...state.data.family,
                            parents: [...currentParents, {
                                id: crypto.randomUUID(),
                                relationship: '',
                                firstName: '',
                                lastName: '',
                                age: 0,
                                email: '',
                                educationLevel: '',
                                occupation: '',
                                employer: '',
                                isLiving: 'yes',
                            }],
                        },
                    }
                };
            }),
            removeParent: (id) => set((state) => {
                const currentParents = (state.data.family?.parents as Parent[]) || [];
                return {
                    data: {
                        ...state.data,
                        family: { ...state.data.family, parents: currentParents.filter((p) => p.id !== id) },
                    }
                };
            }),
            updateParent: (id, updates) => set((state) => {
                const currentParents = (state.data.family?.parents as Parent[]) || [];
                return {
                    data: {
                        ...state.data,
                        family: {
                            ...state.data.family,
                            parents: currentParents.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                        },
                    }
                };
            }),
        }),
        {
            name: 'unlock-profile-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
