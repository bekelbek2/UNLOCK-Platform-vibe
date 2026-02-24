'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Program {
    id: string;
    name: string;
    country: string;
    type: 'program';
    duration: string;
    cost: string;
    deadline: string;
    logoUrl: string;
}

const SEED_PROGRAMS: Program[] = [
    {
        id: 'prog-1',
        name: 'Research Science Institute (RSI)',
        country: 'United States',
        type: 'program',
        duration: '6 weeks',
        cost: 'Free (fully funded)',
        deadline: 'January 12, 2026',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/MIT_Seal.svg/200px-MIT_Seal.svg.png',
    },
    {
        id: 'prog-2',
        name: 'Yale Young Global Scholars (YYGS)',
        country: 'United States',
        type: 'program',
        duration: '2 weeks',
        cost: '$6,500 (aid available)',
        deadline: 'February 5, 2026',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yale_University_logo.svg/200px-Yale_University_logo.svg.png',
    },
    {
        id: 'prog-3',
        name: 'Summer Science Program (SSP)',
        country: 'United States',
        type: 'program',
        duration: '5 weeks',
        cost: 'Free (need-based)',
        deadline: 'March 5, 2026',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Caltech_Logo.png/200px-Caltech_Logo.png',
    },
    {
        id: 'prog-4',
        name: 'Pioneer Academics',
        country: 'Online',
        type: 'program',
        duration: '3 months',
        cost: '$5,900',
        deadline: 'March 15, 2026',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_the_Pacific.svg/200px-Seal_of_University_of_the_Pacific.svg.png',
    },
    {
        id: 'prog-5',
        name: 'LaunchX',
        country: 'United States',
        type: 'program',
        duration: '4 weeks',
        cost: '$5,500 (aid available)',
        deadline: 'February 20, 2026',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
    },
];

interface ProgramStore {
    programs: Program[];
    addProgram: (prog: Omit<Program, 'id' | 'type'>) => void;
    removeProgram: (id: string) => void;
}

export const useProgramStore = create<ProgramStore>()(
    persist(
        (set, get) => ({
            programs: SEED_PROGRAMS,

            addProgram: (prog) =>
                set((state) => ({
                    programs: [
                        ...state.programs,
                        { ...prog, id: crypto.randomUUID(), type: 'program' as const },
                    ],
                })),

            removeProgram: (id) =>
                set((state) => ({
                    programs: state.programs.filter((p) => p.id !== id),
                })),
        }),
        {
            name: 'unlock-programs-catalog',
            // Only merge if no programs exist in storage yet
            merge: (persisted, current) => {
                const p = persisted as ProgramStore | undefined;
                if (p && p.programs && p.programs.length > 0) {
                    return { ...current, ...p };
                }
                return current;
            },
        }
    )
);
