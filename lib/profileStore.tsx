'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Honor {
    id: string;
    title: string;
    gradeLevels: string[];
    recognitionLevels: string[];
    status: 'draft' | 'ready'; // New
    appearOnProfile: boolean; // New
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
    status: 'draft' | 'ready'; // New
    appearOnProfile: boolean; // New
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
    taxPaid?: number; // New: Track tax per income source
    isTaxable?: boolean; // New: Track if income is taxable
    type: string; // e.g., 'salary', 'business', 'other'
}

export interface AssetItem {
    id: string;
    source: string;
    value: number;
    type: string; // e.g., 'property', 'savings', 'investment'
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
        debts: DebtItem[]; // New: Dynamic Debts
        [key: string]: unknown; // Allow other static props for now
    };
    essays: Essay[];
    recommendations: Recommendation[];
}

interface ProfileDataContextType {
    data: StudentData;
    updatePersonal: (personal: Record<string, unknown>) => void;
    updateFamily: (family: Record<string, unknown>) => void;
    updateEducation: (education: Record<string, unknown>) => void;
    setTestScores: (scores: Record<string, unknown>[]) => void;
    // Bulk setters
    setActivities: (activities: Activity[]) => void;
    setHonors: (honors: Honor[]) => void;
    // Granular CRUD
    addActivity: (activity: Omit<Activity, 'id'>) => void;
    removeActivity: (id: string) => void;
    updateActivity: (id: string, updates: Partial<Activity>) => void;
    addHonor: (honor: Omit<Honor, 'id'>) => void;
    removeHonor: (id: string) => void;
    updateHonor: (id: string, updates: Partial<Honor>) => void;
    updateFinance: (finance: Record<string, unknown>) => void;
    // Finance CRUD
    addIncome: (item: Omit<IncomeItem, 'id'>) => void;
    removeIncome: (id: string) => void;
    addAsset: (item: Omit<AssetItem, 'id'>) => void;
    removeAsset: (id: string) => void;
    addOtherExpense: (item: Omit<OtherExpenseItem, 'id'>) => void;
    removeOtherExpense: (id: string) => void;
    addDebt: (item: Omit<DebtItem, 'id'>) => void;
    removeDebt: (id: string) => void;

    // Essay CRUD
    addEssay: (title: string, linkedDocumentId: string) => void;
    removeEssay: (id: string) => void;
    updateEssay: (id: string, updates: Partial<Essay>) => void;
    // Recommendation CRUD
    addRecommendation: (title: string, linkedDocumentId: string) => void;
    removeRecommendation: (id: string) => void;

    // Parent CRUD
    addParent: () => void;
    removeParent: (id: string) => void;
    updateParent: (id: string, updates: Partial<Parent>) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unlock_student_data';

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

export function loadFromStorage(): StudentData {
    if (typeof window === 'undefined') return defaultData;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData;
        const parsed = JSON.parse(raw);

        const migratedData: StudentData = { ...defaultData, ...parsed };

        // Ensure finance object exists
        if (!migratedData.finance) migratedData.finance = { incomes: [], assets: [], otherExpenses: [], debts: [] };
        if (!migratedData.finance.incomes) migratedData.finance.incomes = [];
        if (!migratedData.finance.assets) migratedData.finance.assets = [];
        if (!migratedData.finance.otherExpenses) migratedData.finance.otherExpenses = [];
        if (!migratedData.finance.debts) migratedData.finance.debts = [];

        // Migration: Check for legacy static fields and move to arrays if empty
        // @ts-ignore
        const legacy = migratedData.finance;
        if (migratedData.finance.incomes.length === 0) {
            // @ts-ignore
            if (legacy.fatherGrossIncome) {
                migratedData.finance.incomes.push({ id: 'migrated-father', source: "Father's Income", amount: Number(legacy.fatherGrossIncome), type: 'salary' });
            }
            // @ts-ignore
            if (legacy.motherGrossIncome) {
                migratedData.finance.incomes.push({ id: 'migrated-mother', source: "Mother's Income", amount: Number(legacy.motherGrossIncome), type: 'salary' });
            }
            // @ts-ignore
            if (legacy.otherIncome) {
                migratedData.finance.incomes.push({ id: 'migrated-other', source: "Other Income", amount: Number(legacy.otherIncome), type: 'other' });
            }
        }

        if (migratedData.finance.assets.length === 0) {
            // @ts-ignore
            if (legacy.savings) {
                migratedData.finance.assets.push({ id: 'migrated-savings', source: "Savings", value: Number(legacy.savings), type: 'savings' });
            }
            // @ts-ignore
            if (legacy.investments) {
                migratedData.finance.assets.push({ id: 'migrated-investments', source: "Investments", value: Number(legacy.investments), type: 'investment' });
            }
            // @ts-ignore
            if (legacy.homeMarketValue && legacy.ownsHome) {
                // @ts-ignore
                migratedData.finance.assets.push({ id: 'migrated-home', source: "Home Value", value: Number(legacy.homeMarketValue), type: 'property' });
            }
        }

        // Migration: Check for legacy single essay
        // @ts-ignore - 'essay' property might exist in old data
        if (parsed.essay?.personalStatementId && (!parsed.essays || parsed.essays.length === 0)) {
            migratedData.essays = [{
                id: 'legacy-personal-statement',
                title: 'Personal Statement',
                // @ts-ignore
                linkedDocumentId: parsed.essay.personalStatementId
            }];
        }


        // Migration: Parents (parent1/parent2 -> parents array)
        // @ts-ignore
        const p1 = parsed.family?.parent1;
        // @ts-ignore
        const p2 = parsed.family?.parent2;
        // @ts-ignore
        const existingParents = parsed.family?.parents;

        if (!existingParents || !Array.isArray(existingParents)) {
            const migratedParents: Parent[] = [];
            if (p1 && (p1.firstName || p1.lastName)) {
                migratedParents.push({ id: 'parent-1', ...p1, age: 0, email: '', employer: '' });
            }
            if (p2 && (p2.firstName || p2.lastName)) {
                migratedParents.push({ id: 'parent-2', ...p2, age: 0, email: '', employer: '' });
            }
            if (migratedParents.length === 0) {
                migratedParents.push({ id: '1', relationship: '', firstName: '', lastName: '', age: 0, email: '', educationLevel: '', occupation: '', employer: '', isLiving: 'yes' });
                migratedParents.push({ id: '2', relationship: '', firstName: '', lastName: '', age: 0, email: '', educationLevel: '', occupation: '', employer: '', isLiving: 'yes' });
            }

            // @ts-ignore
            if (!migratedData.family) migratedData.family = {};
            // @ts-ignore
            migratedData.family.parents = migratedParents;
        }

        // Ensure arrays exist
        if (!migratedData.essays) migratedData.essays = [];
        if (!migratedData.recommendations) migratedData.recommendations = [];
        if (!migratedData.activities) migratedData.activities = [];
        if (!migratedData.honors) migratedData.honors = [];

        return migratedData;
    } catch {
        return defaultData;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ProfileDataContext = createContext<ProfileDataContextType | null>(null);

export function ProfileDataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<StudentData>(defaultData);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount (client-only)
    useEffect(() => {
        setData(loadFromStorage());
        setHydrated(true);
    }, []);

    // Persist to localStorage on every change (after hydration)
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Storage full or unavailable — silent fail
        }
    }, [data, hydrated]);

    const updatePersonal = useCallback((personal: Record<string, unknown>) => {
        setData((prev) => ({ ...prev, personal }));
    }, []);

    const updateFamily = useCallback((family: Record<string, unknown>) => {
        setData((prev) => ({ ...prev, family }));
    }, []);

    const updateEducation = useCallback((education: Record<string, unknown>) => {
        setData((prev) => ({ ...prev, education }));
    }, []);

    const setTestScores = useCallback((testScores: Record<string, unknown>[]) => {
        setData((prev) => ({ ...prev, testScores }));
    }, []);

    const setActivities = useCallback((activities: Activity[]) => {
        setData((prev) => ({ ...prev, activities }));
    }, []);

    const setHonors = useCallback((honors: Honor[]) => {
        setData((prev) => ({ ...prev, honors }));
    }, []);

    // ─── Granular CRUD ────────────────────────────────────────────────────────

    const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
        const newActivity: Activity = { id: Date.now().toString(), ...activity };
        setData((prev) => ({ ...prev, activities: [...prev.activities, newActivity] }));
    }, []);

    const removeActivity = useCallback((id: string) => {
        setData((prev) => ({ ...prev, activities: prev.activities.filter((a) => a.id !== id) }));
    }, []);

    const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
        setData((prev) => ({
            ...prev,
            activities: prev.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
    }, []);

    const addHonor = useCallback((honor: Omit<Honor, 'id'>) => {
        const newHonor: Honor = { id: Date.now().toString(), ...honor };
        setData((prev) => ({ ...prev, honors: [...prev.honors, newHonor] }));
    }, []);

    const removeHonor = useCallback((id: string) => {
        setData((prev) => ({ ...prev, honors: prev.honors.filter((h) => h.id !== id) }));
    }, []);

    const updateHonor = useCallback((id: string, updates: Partial<Honor>) => {
        setData((prev) => ({
            ...prev,
            honors: prev.honors.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
    }, []);

    const updateFinance = useCallback((finance: Record<string, unknown>) => {
        // preserve arrays if full object update doesn't have them? 
        // usually updateFinance comes from form submit which presumably has all data
        // but let's be safe: spread old finance then new
        setData((prev) => ({ ...prev, finance: { ...prev.finance, ...finance } }));
    }, []);

    // ─── Finance CRUD ────────────────────────────────────────────────────────
    const addIncome = useCallback((item: Omit<IncomeItem, 'id'>) => {
        const newItem: IncomeItem = { id: Date.now().toString(), ...item };
        setData((prev) => ({ ...prev, finance: { ...prev.finance, incomes: [...prev.finance.incomes, newItem] } }));
    }, []);

    const removeIncome = useCallback((id: string) => {
        setData((prev) => ({ ...prev, finance: { ...prev.finance, incomes: prev.finance.incomes.filter(i => i.id !== id) } }));
    }, []);

    const addAsset = useCallback((item: Omit<AssetItem, 'id'>) => {
        const newItem: AssetItem = { id: Date.now().toString(), ...item };
        setData((prev) => ({ ...prev, finance: { ...prev.finance, assets: [...prev.finance.assets, newItem] } }));
    }, []);

    const removeAsset = useCallback((id: string) => {
        setData((prev) => ({ ...prev, finance: { ...prev.finance, assets: prev.finance.assets.filter(i => i.id !== id) } }));
    }, []);

    const addOtherExpense = useCallback((item: Omit<OtherExpenseItem, 'id'>) => {
        const newItem: OtherExpenseItem = { id: Date.now().toString(), ...item };
        setData((prev) => ({ ...prev, finance: { ...prev.finance, otherExpenses: [...prev.finance.otherExpenses, newItem] } }));
    }, []);

    const removeOtherExpense = useCallback((id: string) => {
        setData((prev) => ({ ...prev, finance: { ...prev.finance, otherExpenses: prev.finance.otherExpenses.filter(i => i.id !== id) } }));
    }, []);

    const addDebt = useCallback((item: Omit<DebtItem, 'id'>) => {
        const newItem: DebtItem = { id: Date.now().toString(), ...item };
        setData((prev) => ({ ...prev, finance: { ...prev.finance, debts: [...prev.finance.debts, newItem] } }));
    }, []);

    const removeDebt = useCallback((id: string) => {
        setData((prev) => ({ ...prev, finance: { ...prev.finance, debts: prev.finance.debts.filter(i => i.id !== id) } }));
    }, []);


    // ─── Essay CRUD ──────────────────────────────────────────────────────────

    const addEssay = useCallback((title: string, linkedDocumentId: string) => {
        const newEssay: Essay = {
            id: Date.now().toString(),
            title,
            linkedDocumentId
        };
        setData((prev) => ({
            ...prev,
            essays: [...(prev.essays || []), newEssay]
        }));
    }, []);

    const removeEssay = useCallback((id: string) => {
        setData((prev) => ({
            ...prev,
            essays: prev.essays.filter(e => e.id !== id)
        }));
    }, []);

    const updateEssay = useCallback((id: string, updates: Partial<Essay>) => {
        setData((prev) => ({
            ...prev,
            essays: prev.essays.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    }, []);

    // ─── Recommendation CRUD ────────────────────────────────────────────────

    const addRecommendation = useCallback((title: string, linkedDocumentId: string) => {
        const newRec: Recommendation = {
            id: Date.now().toString(),
            title,
            linkedDocumentId
        };
        setData((prev) => ({
            ...prev,
            recommendations: [...(prev.recommendations || []), newRec]
        }));
    }, []);

    const removeRecommendation = useCallback((id: string) => {
        setData((prev) => ({
            ...prev,
            recommendations: prev.recommendations.filter(r => r.id !== id)
        }));
    }, []);

    // ─── Parent CRUD ────────────────────────────────────────────────────────
    const addParent = useCallback(() => {
        const newParent: Parent = {
            id: Date.now().toString(),
            relationship: '',
            firstName: '',
            lastName: '',
            age: 0,
            email: '',
            educationLevel: '',
            occupation: '',
            employer: '',
            isLiving: 'yes'
        };
        setData((prev) => {
            // @ts-ignore
            const currentParents = (prev.family?.parents as Parent[]) || [];
            // Limit to 4
            if (currentParents.length >= 4) return prev;

            return {
                ...prev,
                family: {
                    ...prev.family,
                    parents: [...currentParents, newParent]
                }
            };
        });
    }, []);

    const removeParent = useCallback((id: string) => {
        setData((prev) => {
            // @ts-ignore
            const currentParents = (prev.family?.parents as Parent[]) || [];
            return {
                ...prev,
                family: {
                    ...prev.family,
                    parents: currentParents.filter(p => p.id !== id)
                }
            };
        });
    }, []);

    const updateParent = useCallback((id: string, updates: Partial<Parent>) => {
        setData((prev) => {
            // @ts-ignore
            const currentParents = (prev.family?.parents as Parent[]) || [];
            return {
                ...prev,
                family: {
                    ...prev.family,
                    parents: currentParents.map(p => p.id === id ? { ...p, ...updates } : p)
                }
            };
        });
    }, []);

    return (
        <ProfileDataContext.Provider
            value={{
                data,
                updatePersonal,
                updateFamily,
                updateEducation,
                setTestScores,
                setActivities,
                setHonors,
                addActivity,
                removeActivity,
                updateActivity,
                addHonor,
                removeHonor,
                updateHonor,
                updateFinance,
                addIncome,
                removeIncome,
                addAsset,
                removeAsset,
                addOtherExpense,
                removeOtherExpense,
                addDebt,
                removeDebt,
                addEssay,
                removeEssay,
                updateEssay,
                addRecommendation,
                removeRecommendation,
                addParent,
                removeParent,
                updateParent,
            }}
        >
            {children}
        </ProfileDataContext.Provider>
    );
}

export function useProfileData() {
    const ctx = useContext(ProfileDataContext);
    if (!ctx) throw new Error('useProfileData must be used within ProfileDataProvider');
    return ctx;
}
