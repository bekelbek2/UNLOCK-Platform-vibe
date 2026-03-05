import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'student' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'unlock-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
