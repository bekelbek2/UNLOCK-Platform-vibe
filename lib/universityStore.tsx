import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface University {
    id: string;
    name: string;
    country: string;
    state?: string | null;
    city?: string | null;
    rank?: number | null;
    logo_url?: string | null;
    website_url?: string | null;
    acceptance_rate?: number | null;
    type: 'university' | 'program';
    tags: string[];
    created_at?: string;
}

interface UniversityState {
    universities: University[];
    addUniversity: (uni: Omit<University, 'id' | 'created_at'>) => void;
    updateUniversity: (id: string, updates: Partial<University>) => void;
    deleteUniversity: (id: string) => void;
    setUniversities: (unis: University[]) => void;
}

export const useUniversityStore = create<UniversityState>()(
    persist(
        (set) => ({
            universities: [
                // ── Universities ──
                {
                    id: 'uni-001',
                    name: 'Massachusetts Institute of Technology',
                    country: 'United States',
                    state: 'Massachusetts',
                    city: 'Cambridge',
                    rank: 1,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
                    website_url: 'https://www.mit.edu',
                    acceptance_rate: 3.9,
                    type: 'university' as const,
                    tags: ['STEM', 'Research', 'Need-Blind', 'Ivy+'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-002',
                    name: 'Stanford University',
                    country: 'United States',
                    state: 'California',
                    city: 'Stanford',
                    rank: 2,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg',
                    website_url: 'https://www.stanford.edu',
                    acceptance_rate: 3.6,
                    type: 'university' as const,
                    tags: ['STEM', 'Liberal Arts', 'Need-Blind', 'Silicon Valley'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-003',
                    name: 'Harvard University',
                    country: 'United States',
                    state: 'Massachusetts',
                    city: 'Cambridge',
                    rank: 3,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Harvard_University_logo.svg',
                    website_url: 'https://www.harvard.edu',
                    acceptance_rate: 3.2,
                    type: 'university' as const,
                    tags: ['Ivy League', 'Need-Blind', 'Liberal Arts', 'Research'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-004',
                    name: 'University of Oxford',
                    country: 'United Kingdom',
                    state: 'Oxfordshire',
                    city: 'Oxford',
                    rank: 4,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Oxford-University-Circlet.svg',
                    website_url: 'https://www.ox.ac.uk',
                    acceptance_rate: 14.8,
                    type: 'university' as const,
                    tags: ['Research', 'Tutorial System', 'UK', 'Scholarships'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-005',
                    name: 'National University of Singapore',
                    country: 'Singapore',
                    state: null,
                    city: 'Singapore',
                    rank: 8,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/en/b/b9/NUS_coat_of_arms.svg',
                    website_url: 'https://www.nus.edu.sg',
                    acceptance_rate: 5.0,
                    type: 'university' as const,
                    tags: ['Asia', 'STEM', 'Full Scholarship', 'ASEAN Scholarship'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-006',
                    name: 'NYU Abu Dhabi',
                    country: 'United Arab Emirates',
                    state: null,
                    city: 'Abu Dhabi',
                    rank: 18,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/New_York_University_Logo.svg',
                    website_url: 'https://nyuad.nyu.edu',
                    acceptance_rate: 4.0,
                    type: 'university' as const,
                    tags: ['Full Scholarship', 'Global Campus', 'Liberal Arts', 'Middle East'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-007',
                    name: 'ETH Zurich',
                    country: 'Switzerland',
                    state: 'Zurich',
                    city: 'Zurich',
                    rank: 7,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Eth-logo.svg',
                    website_url: 'https://ethz.ch',
                    acceptance_rate: 27.0,
                    type: 'university' as const,
                    tags: ['STEM', 'Europe', 'Engineering', 'Low Tuition'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'uni-008',
                    name: 'University of Tokyo',
                    country: 'Japan',
                    state: 'Tokyo',
                    city: 'Tokyo',
                    rank: 12,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/UTokyo_logo.svg',
                    website_url: 'https://www.u-tokyo.ac.jp/en/',
                    acceptance_rate: 34.0,
                    type: 'university' as const,
                    tags: ['Asia', 'Research', 'MEXT Scholarship', 'STEM'],
                    created_at: '2025-01-01T00:00:00Z',
                },

                // ── Summer Programs ──
                {
                    id: 'prog-001',
                    name: 'MIT MITES Semester (MOSTEC)',
                    country: 'United States',
                    state: 'Massachusetts',
                    city: 'Cambridge',
                    rank: null,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
                    website_url: 'https://mites.mit.edu',
                    acceptance_rate: 8.0,
                    type: 'program' as const,
                    tags: ['STEM', 'Free', 'High School', 'Online + On-campus'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'prog-002',
                    name: 'Stanford Summer Humanities Institute (SSHI)',
                    country: 'United States',
                    state: 'California',
                    city: 'Stanford',
                    rank: null,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg',
                    website_url: 'https://summerhumanities.stanford.edu',
                    acceptance_rate: 6.0,
                    type: 'program' as const,
                    tags: ['Humanities', 'Selective', 'Residential', 'Financial Aid'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'prog-003',
                    name: 'Yale Young Global Scholars (YYGS)',
                    country: 'United States',
                    state: 'Connecticut',
                    city: 'New Haven',
                    rank: null,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Yale_University_logo.svg',
                    website_url: 'https://globalscholars.yale.edu',
                    acceptance_rate: 15.0,
                    type: 'program' as const,
                    tags: ['Leadership', 'Global', 'Residential', 'Need-Based Aid'],
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'prog-004',
                    name: 'Research Science Institute (RSI)',
                    country: 'United States',
                    state: 'Massachusetts',
                    city: 'Cambridge',
                    rank: null,
                    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
                    website_url: 'https://www.cee.org/programs/rsi',
                    acceptance_rate: 3.0,
                    type: 'program' as const,
                    tags: ['STEM', 'Free', 'Most Selective', 'Research'],
                    created_at: '2025-01-01T00:00:00Z',
                },
            ],

            addUniversity: (uni) => set((state) => ({
                universities: [
                    ...state.universities,
                    {
                        ...uni,
                        id: crypto.randomUUID(),
                        created_at: new Date().toISOString()
                    }
                ]
            })),

            updateUniversity: (id, updates) => set((state) => ({
                universities: state.universities.map(u =>
                    u.id === id ? { ...u, ...updates } : u
                )
            })),

            deleteUniversity: (id) => set((state) => ({
                universities: state.universities.filter(u => u.id !== id)
            })),

            setUniversities: (universities) => set({ universities }),
        }),
        {
            name: 'unlock-universities-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
