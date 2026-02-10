'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Honor {
    id: string;
    title: string;
    gradeLevels: string[];
    recognitionLevels: string[];
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
}

export interface StudentData {
    personal: Record<string, unknown>;
    family: Record<string, unknown>;
    education: Record<string, unknown>;
    testScores: Record<string, unknown>[];
    activities: Activity[];
    honors: Honor[];
    finance: Record<string, unknown>;
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
    finance: {},
};

function loadFromStorage(): StudentData {
    if (typeof window === 'undefined') return defaultData;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData;
        const parsed = JSON.parse(raw);
        return { ...defaultData, ...parsed };
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
        setData((prev) => ({ ...prev, finance }));
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
