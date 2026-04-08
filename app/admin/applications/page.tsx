'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApplicationStore } from '@/lib/applicationStore';
import { useSystemStore } from '@/lib/systemStore';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Users,
    GraduationCap,
    Building2,
    Mail,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminMyStudentsPage() {
    const { applications } = useApplicationStore();
    const { users } = useSystemStore();
    const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => setIsMounted(true), []);

    // Count apps per student (since localStorage is shared, all apps belong to all students for now)
    const studentCards = useMemo(() => {
        return students.map((s) => ({
            id: s.id,
            name: s.full_name,
            email: s.email,
            country: (s as unknown as Record<string, unknown>).country as string | undefined,
            targetMajor: (s as unknown as Record<string, unknown>).target_major as string | undefined,
            appCount: applications.length,
        }));
    }, [students, applications]);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return studentCards;
        const q = searchQuery.toLowerCase();
        return studentCards.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.country?.toLowerCase().includes(q) ?? false)
        );
    }, [studentCards, searchQuery]);

    if (!isMounted) {
        return (
            <div className="p-8 min-h-screen bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-72 bg-gray-100 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Select a student to review their university and program applications.
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {students.length} student{students.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search by name, email, or country…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus-visible:ring-[#e75e24] h-10"
                    />
                </div>
            </div>

            {/* Student Cards Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((student) => {
                        const initial = (student.name || 'U').charAt(0).toUpperCase();
                        return (
                            <Link key={student.id} href={`/admin/applications/${student.id}`}>
                                <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#e75e24]/30 transition-all duration-200 p-5 cursor-pointer h-full flex flex-col">
                                    {/* Avatar + Name */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e75e24] to-orange-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                            {initial}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#e75e24] transition-colors">
                                                {student.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 flex-1">
                                        {student.country && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                {student.country}
                                            </div>
                                        )}
                                        {student.targetMajor && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                {student.targetMajor}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <Badge variant="secondary" className="text-[11px] gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {student.appCount} app{student.appCount !== 1 ? 's' : ''}
                                        </Badge>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#e75e24] transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                        <Users className="w-8 h-8 text-[#e75e24]" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-1">No students found</p>
                    <p className="text-gray-500 text-sm">
                        {searchQuery.trim() ? 'Try a different search term.' : 'Students will appear here once they sign up.'}
                    </p>
                </div>
            )}
        </div>
    );
}
