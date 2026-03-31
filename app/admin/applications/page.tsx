'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApplicationStore, type Application, type ApplicationStatus } from '@/lib/applicationStore';
import { useSystemStore } from '@/lib/systemStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    GraduationCap,
    Clock,
    ChevronDown,
    ChevronRight,
    Eye,
    Users,
    CheckCircle2,
    CircleDashed,
    Building2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
    Planning: { label: 'Planning', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Submitted: { label: 'Submitted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcProgress(app: Application): number {
    let score = 0;
    let max = 0;
    max += 2;
    if (app.majors.firstChoice) score++;
    if (app.majors.secondChoice && app.majors.secondChoice !== 'none') score++;
    max += app.supplements.length;
    score += app.supplements.filter((s) => s.linkedDocumentId !== null).length;
    if (max === 0) return 0;
    return Math.round((score / max) * 100);
}

// ─── Student Application Card ────────────────────────────────────────────────
function MiniAppCard({ app }: { app: Application }) {
    const uni = app.university;
    const entityType = app.entityType ?? 'university';
    const statusCfg = STATUS_CONFIG[app.status];
    const progress = calcProgress(app);
    const isMajorsDone = !!app.majors?.firstChoice;
    const linkedCount = app.supplements.filter((s) => s.linkedDocumentId !== null).length;
    const totalSupplements = app.supplements.length;
    const isSupplementsDone = totalSupplements === 0 || linkedCount === totalSupplements;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
            <div className="p-5 flex-1 space-y-4">
                {/* University Row */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {uni?.logo_url ? (
                            <img
                                src={uni.logo_url}
                                alt={app.universityName}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                            />
                        ) : (
                            <GraduationCap className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{app.universityName}</h4>
                            <Badge className={`text-[9px] px-1.5 py-0 h-4 flex-shrink-0 font-semibold ${entityType === 'program' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                {entityType === 'program' ? 'Program' : 'University'}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{app.admissionPlan} · {app.term}</p>
                    </div>
                </div>

                {/* Status + Progress */}
                <div className="flex items-center gap-2">
                    <Badge className={`${statusCfg.className} text-xs font-medium px-2.5 py-0.5 border rounded-full`}>
                        {statusCfg.label}
                    </Badge>
                    <span className="text-xs text-gray-400 ml-auto font-semibold">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-[#e75e24]' : 'bg-amber-400'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Mini Checklist */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        {isMajorsDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <CircleDashed className="w-3.5 h-3.5 text-gray-300" />}
                        <span className={`text-[11px] ${isMajorsDone ? 'text-gray-400 line-through' : 'text-gray-600'}`}>Academics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSupplementsDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <CircleDashed className="w-3.5 h-3.5 text-gray-300" />}
                        <span className={`text-[11px] ${isSupplementsDone ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                            Supplements{totalSupplements > 0 && <span className="text-gray-400 ml-1">({linkedCount}/{totalSupplements})</span>}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Button */}
            <div className="px-5 pb-4">
                <Link href={`/admin/applications/${app.id}`}>
                    <Button variant="outline" className="w-full h-9 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#e75e24] hover:text-[#e75e24] transition-colors gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        View Application
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── Student Accordion ───────────────────────────────────────────────────────
function StudentAccordion({
    studentName,
    studentEmail,
    apps,
    isExpanded,
    onToggle,
}: {
    studentName: string;
    studentEmail: string;
    apps: Application[];
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const initial = (studentName || 'U').charAt(0).toUpperCase();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors text-left"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e75e24] to-orange-400 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">{studentName}</h3>
                    <p className="text-xs text-gray-500 truncate">{studentEmail}</p>
                </div>
                <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                    <Building2 className="w-3 h-3" />
                    {apps.length} app{apps.length !== 1 ? 's' : ''}
                </Badge>
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {apps.map((app) => (
                            <MiniAppCard key={app.id} app={app} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
    const { applications } = useApplicationStore();
    const { users } = useSystemStore();
    const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

    useEffect(() => setIsMounted(true), []);

    // Group applications by student (using universityId is global, but we need to match by who created them)
    // Since the store doesn't track userId per application, we show ALL applications grouped by the student list
    // For now, all apps are visible to admin — in a real app, apps would have a studentId field
    const studentAppGroups = useMemo(() => {
        const groups: { studentId: string; studentName: string; studentEmail: string; apps: Application[] }[] = [];

        // Since apps are global (localStorage), show them under all students for now
        // If apps had a studentId field, we'd filter here
        // For the current architecture, we group all apps together under a "All Students" view
        // But a better UX is to just show all applications in a flat list grouped by student initial
        if (applications.length > 0) {
            students.forEach((student) => {
                // Show all applications for each student (shared localStorage means shared data)
                groups.push({
                    studentId: student.id,
                    studentName: student.full_name,
                    studentEmail: student.email,
                    apps: applications,
                });
            });
        }

        return groups;
    }, [applications, students]);

    // Filter by search
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return studentAppGroups;
        const q = searchQuery.toLowerCase();
        return studentAppGroups
            .map((group) => ({
                ...group,
                apps: group.apps.filter(
                    (app) =>
                        app.universityName.toLowerCase().includes(q) ||
                        group.studentName.toLowerCase().includes(q)
                ),
            }))
            .filter((group) => group.apps.length > 0);
    }, [studentAppGroups, searchQuery]);

    const toggleStudent = (studentId: string) => {
        setExpandedStudents((prev) => {
            const next = new Set(prev);
            if (next.has(studentId)) next.delete(studentId);
            else next.add(studentId);
            return next;
        });
    };

    const totalApps = applications.length;

    if (!isMounted) {
        return (
            <div className="p-8 min-h-screen bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-72 bg-gray-100 rounded" />
                    <div className="h-20 bg-gray-100 rounded-xl mt-8" />
                    <div className="h-20 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Review each student&apos;s university and program applications.
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {totalApps} application{totalApps !== 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search by student or university…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus-visible:ring-[#e75e24] h-10"
                    />
                </div>
            </div>

            {/* Student Accordions */}
            {filteredGroups.length > 0 ? (
                <div className="space-y-4">
                    {filteredGroups.map((group) => (
                        <StudentAccordion
                            key={group.studentId}
                            studentName={group.studentName}
                            studentEmail={group.studentEmail}
                            apps={group.apps}
                            isExpanded={expandedStudents.has(group.studentId)}
                            onToggle={() => toggleStudent(group.studentId)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                        <Users className="w-8 h-8 text-[#e75e24]" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-1">No applications yet</p>
                    <p className="text-gray-500 text-sm">
                        Student applications will appear here once they start adding universities.
                    </p>
                </div>
            )}
        </div>
    );
}
