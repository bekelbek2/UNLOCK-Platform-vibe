import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from './authStore';

export interface SystemState {
    users: User[];
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    deleteUser: (id: string) => void;
    setUsers: (users: User[]) => void;
}

export const useSystemStore = create<SystemState>()(
    persist(
        (set) => ({
            users: [
                // ── Admin / Mentor accounts ──
                {
                    id: 'admin-001',
                    email: 'admin@unlock.com',
                    full_name: 'Aziz Khodjaev',
                    role: 'admin' as UserRole,
                    avatar_url: null,
                },
                {
                    id: 'mentor-001',
                    email: 'alina.f@unlock.com',
                    full_name: 'Alina Fayzullayeva',
                    role: 'admin' as UserRole,
                    avatar_url: null,
                },
                {
                    id: 'mentor-002',
                    email: 'john.d@unlock.com',
                    full_name: 'John Davidson',
                    role: 'admin' as UserRole,
                    avatar_url: null,
                },
                {
                    id: 'mentor-003',
                    email: 'sarah.k@unlock.com',
                    full_name: 'Sarah Kim',
                    role: 'admin' as UserRole,
                    avatar_url: null,
                },

                // ── Student accounts ──
                {
                    id: 'stu-001',
                    email: 'jasur.a@student.com',
                    full_name: 'Jasur Alimov',
                    role: 'student' as UserRole,
                    avatar_url: null,
                    country: 'Uzbekistan',
                    city: 'Tashkent',
                    phone: '+998 90 123 4567',
                    date_of_birth: '2007-03-15',
                    school_name: 'Presidential School Tashkent',
                    grade: '11',
                    gpa: '3.92',
                    sat_score: '1480',
                    ielts_score: '7.5',
                    target_major: 'Computer Science',
                    bio: 'Passionate coder and competitive programmer aiming for top US universities. Founded a coding club with 120+ members.',
                    created_at: '2025-09-01T10:00:00Z',
                },
                {
                    id: 'stu-002',
                    email: 'dilnoza.r@student.com',
                    full_name: 'Dilnoza Rakhimova',
                    role: 'student' as UserRole,
                    avatar_url: null,
                    country: 'Uzbekistan',
                    city: 'Samarkand',
                    phone: '+998 91 456 7890',
                    date_of_birth: '2007-07-22',
                    school_name: 'Samarkand International School',
                    grade: '12',
                    gpa: '3.88',
                    sat_score: '1420',
                    ielts_score: '8.0',
                    target_major: 'International Relations',
                    bio: 'Model UN delegate and aspiring diplomat. Fluent in Uzbek, Russian, and English. Research intern at UNDP Uzbekistan.',
                    created_at: '2025-08-15T14:30:00Z',
                },
                {
                    id: 'stu-003',
                    email: 'kevin.t@student.com',
                    full_name: 'Kevin Tran',
                    role: 'student' as UserRole,
                    avatar_url: null,
                    country: 'Vietnam',
                    city: 'Ho Chi Minh City',
                    phone: '+84 912 345 678',
                    date_of_birth: '2007-11-05',
                    school_name: 'British International School HCMC',
                    grade: '11',
                    gpa: '3.95',
                    sat_score: '1520',
                    ielts_score: '8.5',
                    target_major: 'Economics',
                    bio: 'Won national economics olympiad. Founded a micro-lending initiative for local street vendors. Plays classical piano.',
                    created_at: '2025-10-02T09:15:00Z',
                },
                {
                    id: 'stu-004',
                    email: 'amina.s@student.com',
                    full_name: 'Amina Sabirova',
                    role: 'student' as UserRole,
                    avatar_url: null,
                    country: 'Kazakhstan',
                    city: 'Almaty',
                    phone: '+7 701 234 5678',
                    date_of_birth: '2008-01-30',
                    school_name: 'NIS Almaty Physics & Math',
                    grade: '10',
                    gpa: '3.97',
                    sat_score: '1460',
                    ielts_score: '7.0',
                    target_major: 'Biomedical Engineering',
                    bio: 'Published a research paper on affordable prosthetics at age 15. Volunteer at a children\'s hospital and national biology olympiad finalist.',
                    created_at: '2025-11-10T16:45:00Z',
                },
                {
                    id: 'stu-005',
                    email: 'omar.h@student.com',
                    full_name: 'Omar Hassan',
                    role: 'student' as UserRole,
                    avatar_url: null,
                    country: 'Egypt',
                    city: 'Cairo',
                    phone: '+20 100 234 5678',
                    date_of_birth: '2007-06-12',
                    school_name: 'Cairo American College',
                    grade: '12',
                    gpa: '3.85',
                    sat_score: '1390',
                    ielts_score: '7.5',
                    target_major: 'Mechanical Engineering',
                    bio: 'Built a solar-powered desalination unit for rural communities. Captain of school robotics team. FIRST Robotics regional finalist.',
                    created_at: '2025-07-20T11:00:00Z',
                },
            ],

            addUser: (user) => set((state) => ({
                users: [
                    ...state.users,
                    {
                        ...user,
                        id: crypto.randomUUID(),
                    }
                ]
            })),

            updateUser: (id, updates) => set((state) => ({
                users: state.users.map(u =>
                    u.id === id ? { ...u, ...updates } : u
                )
            })),

            deleteUser: (id) => set((state) => ({
                users: state.users.filter(u => u.id !== id)
            })),

            setUsers: (users) => set({ users }),
        }),
        {
            name: 'unlock-system-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
