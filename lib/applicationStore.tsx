'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { University } from './universityStore';

export type ApplicationStatus = 'Planning' | 'In Progress' | 'Submitted';

export interface Application {
    id: string;
    universityId: string;
    universityName: string;
    entityType: 'university' | 'program';
    term: string;
    admissionPlan: string;
    deadline: string;
    status: ApplicationStatus;
    createdAt: string;
    majors: { firstChoice: string; secondChoice: string };
    supplements: Array<{ id: string; title: string; linkedDocumentId: string | null }>;
    // Joined university data 
    university?: University | null;
}

interface ApplicationStore {
    applications: Application[];
    isLoading: boolean;
    userId: string | null;

    initialize: (userId: string) => Promise<void>;

    addApplication: (
        app: Omit<Application, 'id' | 'createdAt' | 'status' | 'majors' | 'supplements' | 'university'>,
        universityData: University | null
    ) => Promise<void>;
    removeApplication: (id: string) => Promise<void>;
    updateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
    updateMajors: (id: string, majors: Application['majors']) => Promise<void>;

    addSupplement: (appId: string, title: string) => Promise<void>;
    removeSupplement: (appId: string, suppId: string) => Promise<void>;
    linkSupplement: (appId: string, suppId: string, documentId: string | null) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>()(
    persist(
        (set, get) => ({
            applications: [],
            isLoading: false,
            userId: null,

            initialize: async (userId: string) => {
                set({ userId, isLoading: false });
            },

            addApplication: async (app, universityData) => {
                const userId = get().userId;
                if (!userId) return;

                const newApp: Application = {
                    id: crypto.randomUUID(),
                    universityId: app.universityId || '',
                    universityName: app.universityName || '',
                    entityType: app.entityType || 'university',
                    term: app.term || '',
                    admissionPlan: app.admissionPlan || '',
                    deadline: app.deadline || '',
                    status: 'Planning',
                    createdAt: new Date().toISOString(),
                    majors: { firstChoice: '', secondChoice: '' },
                    supplements: [],
                    university: universityData,
                };

                set((state) => ({
                    applications: [newApp, ...state.applications],
                }));
            },

            removeApplication: async (id) => {
                set((state) => ({
                    applications: state.applications.filter((a) => a.id !== id),
                }));
            },

            updateStatus: async (id, status) => {
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === id ? { ...a, status } : a
                    ),
                }));
            },

            updateMajors: async (id, majors) => {
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === id ? { ...a, majors } : a
                    ),
                }));
            },

            addSupplement: async (appId, title) => {
                set((state) => ({
                    applications: state.applications.map((a) => {
                        if (a.id !== appId) return a;
                        return {
                            ...a,
                            supplements: [
                                ...a.supplements,
                                { id: crypto.randomUUID(), title, linkedDocumentId: null }
                            ]
                        };
                    })
                }));
            },

            removeSupplement: async (appId, suppId) => {
                set((state) => ({
                    applications: state.applications.map((a) => {
                        if (a.id !== appId) return a;
                        return {
                            ...a,
                            supplements: a.supplements.filter(s => s.id !== suppId)
                        };
                    })
                }));
            },

            linkSupplement: async (appId, suppId, documentId) => {
                set((state) => ({
                    applications: state.applications.map((a) => {
                        if (a.id !== appId) return a;
                        return {
                            ...a,
                            supplements: a.supplements.map((s) =>
                                s.id === suppId ? { ...s, linkedDocumentId: documentId } : s
                            )
                        };
                    })
                }));
            },
        }),
        {
            name: 'unlock-applications-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
