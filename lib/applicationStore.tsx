'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface ApplicationStore {
    applications: Application[];

    addApplication: (
        app: Omit<Application, 'id' | 'createdAt' | 'status' | 'majors' | 'supplements'>
    ) => void;
    removeApplication: (id: string) => void;
    updateStatus: (id: string, status: ApplicationStatus) => void;
    updateMajors: (id: string, majors: Application['majors']) => void;

    addSupplement: (appId: string, title: string) => void;
    removeSupplement: (appId: string, suppId: string) => void;
    linkSupplement: (appId: string, suppId: string, documentId: string | null) => void;
}

export const useApplicationStore = create<ApplicationStore>()(
    persist(
        (set) => ({
            applications: [],

            addApplication: (app) =>
                set((state) => ({
                    applications: [
                        ...state.applications,
                        {
                            ...app,
                            entityType: app.entityType ?? 'university',
                            id: crypto.randomUUID(),
                            status: 'Planning',
                            createdAt: new Date().toISOString(),
                            majors: { firstChoice: '', secondChoice: '' },
                            supplements: [],
                        },
                    ],
                })),

            removeApplication: (id) =>
                set((state) => ({
                    applications: state.applications.filter((a) => a.id !== id),
                })),

            updateStatus: (id, status) =>
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === id ? { ...a, status } : a
                    ),
                })),

            updateMajors: (id, majors) =>
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === id ? { ...a, majors } : a
                    ),
                })),

            addSupplement: (appId, title) =>
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === appId
                            ? {
                                ...a,
                                supplements: [
                                    ...a.supplements,
                                    { id: crypto.randomUUID(), title, linkedDocumentId: null },
                                ],
                            }
                            : a
                    ),
                })),

            removeSupplement: (appId, suppId) =>
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === appId
                            ? { ...a, supplements: a.supplements.filter((s) => s.id !== suppId) }
                            : a
                    ),
                })),

            linkSupplement: (appId, suppId, documentId) =>
                set((state) => ({
                    applications: state.applications.map((a) =>
                        a.id === appId
                            ? {
                                ...a,
                                supplements: a.supplements.map((s) =>
                                    s.id === suppId ? { ...s, linkedDocumentId: documentId } : s
                                ),
                            }
                            : a
                    ),
                })),
        }),
        { name: 'unlock-applications-storage' }
    )
);
