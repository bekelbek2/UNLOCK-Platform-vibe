'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApplicationStore, type Application, type ApplicationStatus } from '@/lib/applicationStore';
import { useSystemStore } from '@/lib/systemStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    GraduationCap,
    Clock,
    Eye,
    ChevronLeft,
    LayoutGrid,
    List,
    CheckCircle2,
    CircleDashed,
    ArrowRight,
    Building2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
    Planning: { label: 'Planning', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Submitted: { label: 'Submitted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

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

// ─── Grid Card ───────────────────────────────────────────────────────────────
function AppGridCard({ app, studentId }: { app: Application; studentId: string }) {
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
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {uni?.logo_url ? (
                            <img src={uni.logo_url} alt={app.universityName} className="w-full h-full object-contain p-1" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
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

                <div className="flex items-center gap-2">
                    <Badge className={`${statusCfg.className} text-xs font-medium px-2.5 py-0.5 border rounded-full`}>{statusCfg.label}</Badge>
                    <span className="text-xs text-gray-400 ml-auto font-semibold">{progress}%</span>
                </div>

                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-[#e75e24]' : 'bg-amber-400'}`} style={{ width: `${progress}%` }} />
                </div>

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

            <div className="px-5 pb-4">
                <Link href={`/admin/applications/${studentId}/${app.id}`}>
                    <Button variant="outline" className="w-full h-9 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#e75e24] hover:text-[#e75e24] transition-colors gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        View Application
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── List Row ────────────────────────────────────────────────────────────────
function AppListRow({ app, studentId }: { app: Application; studentId: string }) {
    const uni = app.university;
    const entityType = app.entityType ?? 'university';
    const statusCfg = STATUS_CONFIG[app.status];
    const progress = calcProgress(app);

    return (
        <Link href={`/admin/applications/${studentId}/${app.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#e75e24]/30 transition-all duration-200 px-5 py-4 flex items-center gap-4 cursor-pointer">
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {uni?.logo_url ? (
                        <img src={uni.logo_url} alt={app.universityName} className="w-full h-full object-contain p-1" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    ) : (
                        <GraduationCap className="w-5 h-5 text-gray-300" />
                    )}
                </div>

                {/* Name + type */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{app.universityName}</h4>
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 flex-shrink-0 font-semibold ${entityType === 'program' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {entityType === 'program' ? 'Program' : 'Uni'}
                        </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{app.admissionPlan} · {app.term}</p>
                </div>

                {/* Status */}
                <Badge className={`${statusCfg.className} text-xs font-medium px-2.5 py-0.5 border rounded-full flex-shrink-0`}>{statusCfg.label}</Badge>

                {/* Progress */}
                <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-[#e75e24]' : 'bg-amber-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 w-8 text-right">{progress}%</span>
                </div>

                {/* Deadline */}
                {app.deadline && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {app.deadline}
                    </span>
                )}

                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentApplicationsPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;

    const { applications } = useApplicationStore();
    const { users } = useSystemStore();

    const student = useMemo(() => users.find((u) => u.id === studentId), [users, studentId]);

    const [isMounted, setIsMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => setIsMounted(true), []);

    // Filter apps by search
    const filteredApps = useMemo(() => {
        if (!searchQuery.trim()) return applications;
        const q = searchQuery.toLowerCase();
        return applications.filter((app) =>
            app.universityName.toLowerCase().includes(q) ||
            app.admissionPlan.toLowerCase().includes(q)
        );
    }, [applications, searchQuery]);

    if (!isMounted) {
        return (
            <div className="p-8 min-h-screen bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-72 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">Student not found.</p>
                <Button variant="outline" onClick={() => router.push('/admin/applications')}>
                    Back to My Students
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Back */}
            <button
                onClick={() => router.push('/admin/applications')}
                className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-[#e75e24] transition-colors mb-6"
            >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Back to My Students
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e75e24] to-orange-400 flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0">
                        {(student.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
                        <p className="text-gray-500 text-sm">{student.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''}
                    </Badge>

                    {/* View Toggle */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search applications…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus-visible:ring-[#e75e24] h-10"
                    />
                </div>
            </div>

            {/* Applications */}
            {filteredApps.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredApps.map((app) => (
                            <AppGridCard key={app.id} app={app} studentId={studentId} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredApps.map((app) => (
                            <AppListRow key={app.id} app={app} studentId={studentId} />
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                        <GraduationCap className="w-8 h-8 text-[#e75e24]" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-1">No applications</p>
                    <p className="text-gray-500 text-sm">
                        {searchQuery.trim() ? 'No matching applications found.' : 'This student hasn\'t added any applications yet.'}
                    </p>
                </div>
            )}
        </div>
    );
}
