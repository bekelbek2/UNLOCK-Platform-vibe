'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Users,
    Shield,
    ArrowLeft,
    LogOut,
    Loader2,
    Layers,
} from 'lucide-react';

const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Universities', href: '/admin/universities', icon: GraduationCap },
    { name: 'Programs', href: '/admin/programs', icon: Layers },
    { name: 'Study Plans', href: '/admin/study-plans', icon: BookOpen },
    { name: 'Mentors & Admins', href: '/admin/mentors', icon: Shield },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    // Defer rendering user data to avoid hydration mismatched on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const handleSignOut = async () => {
        setSigningOut(true);
        logout();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#FFF8F0] flex flex-col z-40 border-r border-[#e75e24]/20">
            {/* Logo + Admin Badge */}
            <div className="px-6 py-6">
                <Image
                    src="/unlockwht.png"
                    alt="Unlock Logo"
                    width={150}
                    height={50}
                    className="h-10 w-auto object-contain brightness-0 sepia saturate-[20] hue-rotate-[10deg]"
                    priority
                />
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#e75e24]/15 text-[#e75e24] text-[10px] font-bold tracking-widest uppercase">
                    Admin Panel
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {adminNavItems.map((item) => {
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-[#e75e24] text-white font-semibold shadow-sm'
                                            : 'text-[#e75e24]/70 hover:text-[#e75e24] hover:bg-[#e75e24]/10'
                                        }`}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="px-4 py-4 space-y-1 border-t border-[#e75e24]/15">
                {mounted && user?.email && (
                    <div className="px-4 py-2 mb-1">
                        <p className="text-[#e75e24]/50 text-[10px] uppercase tracking-widest font-bold">Signed in as</p>
                        <p className="text-gray-900 text-sm font-medium truncate">{user.email}</p>
                    </div>
                )}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-[#e75e24]/70 hover:text-[#e75e24] hover:bg-[#e75e24]/10 transition-colors w-full rounded-md"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Student View</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-3 px-4 py-3 text-[#e75e24]/70 hover:text-[#e75e24] hover:bg-[#e75e24]/10 transition-colors w-full rounded-md"
                >
                    {signingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                    <span>{signingOut ? 'Signing out...' : 'Logout'}</span>
                </button>
            </div>
        </aside>
    );
}
