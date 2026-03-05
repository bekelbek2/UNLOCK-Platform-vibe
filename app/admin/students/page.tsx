'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSystemStore } from '@/lib/systemStore';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Eye,
    Search,
    Loader2,
    Users,
    User as UserIcon,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    BookOpen,
    Target,
    Globe,
    Calendar,
    Award,
} from 'lucide-react';

import { type User } from '@/lib/authStore';

// ─── Minimal Mock Row for Display ──────────────────────────────────────────────
interface StudentDisplayRow extends User {
    country?: string | null;
    created_at?: string;
    target_major?: string | null;
    phone?: string | null;
    city?: string | null;
    date_of_birth?: string | null;
    school_name?: string | null;
    grade?: string | null;
    gpa?: string | null;
    sat_score?: string | null;
    ielts_score?: string | null;
    bio?: string | null;
}
export default function AdminStudentsPage() {
    const { users } = useSystemStore();
    const students = useMemo(() => users.filter(u => u.role === 'student') as StudentDisplayRow[], [users]);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentDisplayRow | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // To prevent hydration errors, we only render the table once mounted
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    // ─── Filtered data ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        if (!search.trim()) return students;
        const q = search.toLowerCase();
        return students.filter((s) => {
            return (
                (s.full_name?.toLowerCase().includes(q) ?? false) ||
                (s.email?.toLowerCase().includes(q) ?? false) ||
                (s.country?.toLowerCase().includes(q) ?? false) ||
                (s.target_major?.toLowerCase().includes(q) ?? false)
            );
        });
    }, [students, search]);

    // ─── Open Sheet ───────────────────────────────────────────────────────────
    const handleViewProfile = (student: StudentDisplayRow) => {
        setSelectedStudent(student);
        setSheetOpen(true);
    };

    const selectedProfile = selectedStudent ?? null;

    // ─── Section component ────────────────────────────────────────────────────
    const ProfileSection = ({
        icon: Icon,
        title,
        children,
    }: {
        icon: React.ElementType;
        title: string;
        children: React.ReactNode;
    }) => (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
                <Icon className="w-4 h-4 text-[#e75e24]" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">{children}</div>
        </div>
    );

    const ProfileField = ({
        label,
        value,
    }: {
        label: string;
        value: string | null | undefined;
    }) => (
        <div className="flex justify-between items-start gap-4">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right">
                {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
            </span>
        </div>
    );

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View registered students and their application profiles.
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {students.length} student{students.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Search + Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Search bar */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Search by name, email, country…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                {!isMounted ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#e75e24] animate-spin" />
                    </div>
                ) : filtered.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/80">
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Intended Major</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((student) => {
                                return (
                                    <TableRow
                                        key={student.id}
                                        className="hover:bg-orange-50/30 transition-colors"
                                    >
                                        <TableCell className="font-semibold text-gray-900">
                                            {student.full_name || 'Unknown'}
                                        </TableCell>
                                        <TableCell className="text-gray-600 text-sm">
                                            {student.email || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {student.country ? (
                                                <span className="text-sm text-gray-700">
                                                    {student.country}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {student.target_major ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-blue-50 text-blue-700 border-blue-100 font-medium"
                                                >
                                                    {student.target_major}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-[#e75e24] hover:bg-orange-50"
                                                onClick={() => handleViewProfile(student)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Users className="w-12 h-12 mb-3" />
                        <p className="font-medium text-gray-900 text-lg mb-1">No students found</p>
                        <p className="text-sm text-gray-500">
                            {search.trim()
                                ? 'Try a different search term.'
                                : 'Students will appear here once they sign up.'}
                        </p>
                    </div>
                )}
            </div>

            {/* ═══ Profile Sheet ═══ */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedStudent && (
                        <>
                            <SheetHeader className="pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e75e24] to-orange-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                        {(selectedStudent.full_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-lg">
                                            {selectedStudent.full_name || 'Unknown'}
                                        </SheetTitle>
                                        <SheetDescription className="text-sm text-gray-500">
                                            Student Profile
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="space-y-6 pt-6">
                                {/* Section 1: Personal Details */}
                                <ProfileSection icon={UserIcon} title="Personal Details">
                                    <ProfileField
                                        label="Full Name"
                                        value={selectedStudent.full_name}
                                    />
                                    <ProfileField
                                        label="Email"
                                        value={selectedStudent.email}
                                    />
                                    <ProfileField
                                        label="Phone"
                                        value={selectedStudent.phone}
                                    />
                                    <ProfileField
                                        label="Country"
                                        value={selectedStudent.country}
                                    />
                                    <ProfileField
                                        label="City"
                                        value={selectedStudent.city}
                                    />
                                    <ProfileField
                                        label="Date of Birth"
                                        value={
                                            selectedStudent.date_of_birth
                                                ? new Date(
                                                    selectedStudent.date_of_birth
                                                ).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : null
                                        }
                                    />
                                </ProfileSection>

                                {/* Section 2: Academic Background */}
                                <ProfileSection icon={GraduationCap} title="Academic Background">
                                    <ProfileField
                                        label="School"
                                        value={selectedStudent.school_name}
                                    />
                                    <ProfileField
                                        label="Grade / Year"
                                        value={selectedStudent.grade}
                                    />
                                    <ProfileField
                                        label="GPA"
                                        value={selectedStudent.gpa}
                                    />
                                    <ProfileField
                                        label="SAT Score"
                                        value={selectedStudent.sat_score}
                                    />
                                    <ProfileField
                                        label="IELTS Score"
                                        value={selectedStudent.ielts_score}
                                    />
                                </ProfileSection>

                                {/* Section 3: Application Goals */}
                                <ProfileSection icon={Target} title="Application Goals">
                                    <ProfileField
                                        label="Intended Major"
                                        value={selectedStudent.target_major}
                                    />
                                    {selectedStudent.bio && (
                                        <div>
                                            <span className="text-sm text-gray-500">Bio</span>
                                            <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                                                {selectedStudent.bio}
                                            </p>
                                        </div>
                                    )}
                                </ProfileSection>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
