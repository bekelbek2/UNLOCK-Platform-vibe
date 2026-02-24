'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    GraduationCap,
    Clock,
    ArrowRight,
    Trash2,
    CheckCircle2,
    CircleDashed,
} from 'lucide-react';
import Link from 'next/link';
import { useApplicationStore, type ApplicationStatus, type Application } from '@/lib/applicationStore';
import { universities } from '@/data/universities';
import { useProgramStore } from '@/lib/programStore';
import AddApplicationModal from '@/components/applications/AddApplicationModal';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
    Planning: {
        label: 'Planning',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
    'In Progress': {
        label: 'In Progress',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    Submitted: {
        label: 'Submitted',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseDeadline(deadlineStr: string): Date | null {
    const d = new Date(deadlineStr);
    return isNaN(d.getTime()) ? null : d;
}

function daysUntil(date: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calcProgress(app: Application): number {
    let score = 0;
    let max = 0;

    // Majors: 1 point for first choice, 1 for second
    max += 2;
    if (app.majors.firstChoice) score++;
    if (app.majors.secondChoice && app.majors.secondChoice !== 'none') score++;

    // Supplements: 1 point each if linked
    max += app.supplements.length;
    score += app.supplements.filter((s) => s.linkedDocumentId !== null).length;

    if (max === 0) return 0;
    return Math.round((score / max) * 100);
}

// ─── Application Card ────────────────────────────────────────────────────────
function ApplicationCard({
    app,
    onDelete,
}: {
    app: Application;
    onDelete: (id: string) => void;
}) {
    const { programs } = useProgramStore();
    const entityType = app.entityType ?? 'university';
    const uni = entityType === 'university'
        ? universities.find((u) => u.id === app.universityId)
        : programs.find((p) => p.id === app.universityId);
    const statusCfg = STATUS_CONFIG[app.status];
    const progress = calcProgress(app);

    const deadlineDate = parseDeadline(app.deadline);
    const daysLeft = deadlineDate ? daysUntil(deadlineDate) : null;
    const urgentDeadline = daysLeft !== null && daysLeft <= 14;

    // Checklist logic
    const isMajorsDone = !!app.majors?.firstChoice;
    const linkedCount = app.supplements.filter((s) => s.linkedDocumentId !== null).length;
    const totalSupplements = app.supplements.length;
    const isSupplementsDone = totalSupplements === 0 || linkedCount === totalSupplements;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
            {/* Delete button (top-right, on hover) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(app.id);
                }}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-400"
                title="Remove application"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Card Body */}
            <div className="p-5 flex-1 space-y-4">
                {/* University Row */}
                <div className="flex items-center gap-3 pr-8">
                    <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {uni?.logoUrl ? (
                            <img
                                src={uni.logoUrl}
                                alt={app.universityName}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                            />
                        ) : (
                            <GraduationCap className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                                {app.universityName}
                            </h3>
                            <Badge
                                className={`text-[9px] px-1.5 py-0 h-4 flex-shrink-0 ${entityType === 'program'
                                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                                    : 'bg-blue-50 text-blue-600 border-blue-200'
                                    }`}
                            >
                                {entityType === 'program' ? 'Program' : 'University'}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{uni?.country ?? '—'}</p>
                    </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        className={`${statusCfg.className} text-xs font-medium px-2.5 py-0.5 border rounded-full`}
                    >
                        {statusCfg.label}
                    </Badge>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-medium">{app.admissionPlan}</span>
                </div>

                {/* Deadline Row */}
                {app.deadline && (
                    <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${urgentDeadline ? 'text-red-500' : 'text-gray-500'
                            }`}
                    >
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{app.deadline}</span>
                        {daysLeft !== null && (
                            <span
                                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${urgentDeadline
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {daysLeft <= 0 ? 'Past' : `${daysLeft}d`}
                            </span>
                        )}
                    </div>
                )}

                {/* Progress Bar + Mini Checklist */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-medium text-gray-500">Completion</span>
                        <span
                            className={`text-[11px] font-semibold ${progress === 100 ? 'text-emerald-600' : 'text-gray-700'
                                }`}
                        >
                            {progress}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress === 100
                                ? 'bg-emerald-500'
                                : progress >= 50
                                    ? 'bg-[#e75e24]'
                                    : 'bg-amber-400'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Mini Checklist */}
                    <div className="pt-0.5 space-y-1">
                        {/* Academics item */}
                        <div className="flex items-center gap-1.5">
                            {isMajorsDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <CircleDashed className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            )}
                            <span
                                className={`text-[11px] ${isMajorsDone
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-700 font-medium'
                                    }`}
                            >
                                Academics &amp; Majors
                            </span>
                        </div>

                        {/* Supplements item */}
                        <div className="flex items-center gap-1.5">
                            {isSupplementsDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <CircleDashed className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            )}
                            <span
                                className={`text-[11px] ${isSupplementsDone
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-700 font-medium'
                                    }`}
                            >
                                Writing Supplements
                                {totalSupplements > 0 && (
                                    <span className="ml-1 text-gray-400 font-normal">
                                        ({linkedCount}/{totalSupplements})
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Footer / CTA */}
            <div className="px-5 pb-5">
                <Link href={`/dashboard/applications/${app.id}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 group-hover:border-[#e75e24] group-hover:text-[#e75e24] transition-colors"
                    >
                        Open Workspace
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function ApplicationsContent() {
    const { applications, removeApplication } = useApplicationStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');

    const countries = useMemo(() => {
        const set = new Set<string>();
        applications.forEach((app) => {
            const uni = universities.find((u) => u.id === app.universityId);
            if (uni) set.add(uni.country);
        });
        return Array.from(set).sort();
    }, [applications]);

    const filtered = useMemo(() => {
        return applications.filter((app) => {
            const uni = universities.find((u) => u.id === app.universityId);
            const q = searchQuery.toLowerCase().trim();
            if (q && !app.universityName.toLowerCase().includes(q) && !(uni?.country ?? '').toLowerCase().includes(q))
                return false;
            if (statusFilter !== 'all' && app.status !== statusFilter) return false;
            if (countryFilter !== 'all' && uni?.country !== countryFilter) return false;
            return true;
        });
    }, [applications, searchQuery, statusFilter, countryFilter]);

    const handleDelete = (id: string) => {
        removeApplication(id);
        toast.success('Application removed.');
    };

    return (
        <>
            <Header
                title="Applications"
                subtitle="Track your university applications, deadlines, and essay progress."
                rightContent={
                    <Button
                        className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2 shadow-sm"
                        onClick={() => setModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add University / Program
                    </Button>
                }
            />

            <div className="px-8 pb-8 bg-gray-50 min-h-screen">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Search university…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white border-gray-200 focus-visible:ring-[#e75e24]"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] bg-white border-gray-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <p className="ml-auto text-sm text-gray-400 font-medium">
                        {filtered.length} application{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((app) => (
                            <ApplicationCard key={app.id} app={app} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
                            <GraduationCap className="w-8 h-8 text-[#e75e24]" />
                        </div>
                        <p className="text-gray-900 font-semibold text-lg mb-1">
                            {applications.length === 0 ? 'No applications yet' : 'No matches found'}
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            {applications.length === 0
                                ? 'Start by adding a university to track.'
                                : 'Try adjusting your filters.'}
                        </p>
                        {applications.length === 0 && (
                            <Button
                                className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2"
                                onClick={() => setModalOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Add University / Program
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <AddApplicationModal open={modalOpen} onOpenChange={setModalOpen} />
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
    return (
        <MainLayout>
            <ApplicationsContent />
        </MainLayout>
    );
}
