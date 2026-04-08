'use client';

import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, GraduationCap, FileText, Pencil, Link as LinkIcon, FileOutput, Clock, CalendarClock, BookOpen, ExternalLink, CheckCircle2, Circle, Eye } from 'lucide-react';
import Link from 'next/link';

import { Label } from '@/components/ui/label';

import { useApplicationStore, type ApplicationStatus } from '@/lib/applicationStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Badge } from '@/components/ui/badge';

// ─── Status Config ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
    Planning: { label: 'Planning', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Submitted: { label: 'Submitted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr: string): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Read-only Document Preview ───────────────────────────────────────────────
function DocumentPreview({ docId }: { docId: string }) {
    const { getDocument } = useDocumentStore();
    const doc = getDocument(docId);

    const editor = useEditor(
        {
            immediatelyRender: false,
            editable: false,
            extensions: [StarterKit, Highlight.configure({ multicolor: true })],
            content: doc?.content || '',
            editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none text-gray-700' } },
        },
        [doc?.content]
    );

    if (!doc) return (
        <div className="p-6 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-400">Document not found or deleted.</p>
        </div>
    );

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[120px] max-h-[240px] overflow-y-auto">
            {editor && <EditorContent editor={editor} />}
        </div>
    );
}

// ─── Main Workspace Content ───────────────────────────────────────────────────
export default function AdminApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;
    const appId = params.appId as string;

    const { applications } = useApplicationStore();
    const { documents } = useDocumentStore();

    const application = applications.find((a) => a.id === appId);
    const uni = application?.university;
    const entityType = application?.entityType ?? 'university';

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <GraduationCap className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 mb-4 font-medium">Application not found.</p>
                <Button variant="outline" onClick={() => router.push(`/admin/applications/${studentId}`)}>
                    Return to Student Applications
                </Button>
            </div>
        );
    }

    const linkedCount = application.supplements.filter((s) => s.linkedDocumentId !== null).length;
    const totalSupplements = application.supplements.length;
    const allLinked = totalSupplements > 0 && linkedCount === totalSupplements;
    const isMajorsDone = !!application.majors.firstChoice;

    // Deadline data
    const unlockDays = daysUntil(application.unlockDeadline ?? '');
    const officialDays = daysUntil(application.deadline ?? '');
    const statusCfg = STATUS_CONFIG[application.status];

    return (
        <div className="min-h-screen bg-[#faf9f7]">
            {/* ══════════════ HEADER ══════════════ */}
            <header className="bg-white border-b border-gray-200/80 px-8 py-6 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {/* Breadcrumb */}
                <button
                    onClick={() => router.push(`/admin/applications/${studentId}`)}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-[#e75e24] transition-colors mb-3 group"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5 transition-transform group-hover:-translate-x-0.5" />
                    Back to Student Applications
                </button>

                <div className="flex items-center justify-between gap-6">
                    {/* Left: University identity */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e75e24]/10 to-[#e75e24]/5 border border-[#e75e24]/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {uni?.logo_url ? (
                                <img
                                    src={uni.logo_url}
                                    alt={application.universityName}
                                    className="w-full h-full object-contain p-1.5"
                                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                />
                            ) : (
                                <GraduationCap className="w-6 h-6 text-[#e75e24]" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate leading-tight">
                                {application.universityName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-[10px] font-semibold px-2 py-0 border ${entityType === 'program'
                                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                                    : 'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                    {entityType === 'program' ? 'Program' : 'University'}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <Badge className={`${statusCfg.className} text-[10px] font-semibold px-2 py-0 border`}>
                                    {statusCfg.label}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 font-medium">{application.term}</span>
                                {application.deadlineRoundName && (
                                    <>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-[#e75e24] font-semibold">{application.deadlineRoundName}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Read-Only Badge */}
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs font-semibold px-3 py-1 flex-shrink-0 gap-1.5 h-8">
                        <Eye className="w-3.5 h-3.5" />
                        View Only
                    </Badge>
                </div>
            </header>

            {/* ══════════════ MAIN CONTENT ══════════════ */}
            <main className="max-w-3xl mx-auto px-8 py-8 space-y-6">

                {/* ── DEADLINES CARD ── */}
                {(application.deadline || application.unlockDeadline) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {application.unlockDeadline && (
                            <div className="relative overflow-hidden rounded-2xl border border-[#e75e24]/20 bg-gradient-to-br from-[#e75e24]/[0.06] to-orange-50/50 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-[#e75e24]/10 flex items-center justify-center">
                                                <CalendarClock className="w-3.5 h-3.5 text-[#e75e24]" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e75e24]">UNLOCK Deadline</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{formatDate(application.unlockDeadline)}</p>
                                    </div>
                                    {unlockDays !== null && (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${unlockDays <= 0 ? 'bg-red-100 text-red-600' : unlockDays <= 14 ? 'bg-red-100 text-red-600' : 'bg-[#e75e24]/10 text-[#e75e24]'}`}>
                                            {unlockDays <= 0 ? 'Past due' : `${unlockDays} days`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {application.deadline && (
                            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Official Deadline</span>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{formatDate(application.deadline)}</p>
                                    </div>
                                    {officialDays !== null && (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${officialDays <= 0 ? 'bg-red-100 text-red-600' : officialDays <= 14 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {officialDays <= 0 ? 'Past due' : `${officialDays} days`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ACADEMICS SECTION ── */}
                <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e75e24]/10 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-[#e75e24]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-bold text-gray-900">Academic Preferences</h2>
                            <p className="text-xs text-gray-400">Student's intended majors for this application</p>
                        </div>
                        {isMajorsDone && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                First Choice Major
                            </Label>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                {application.majors.firstChoice || <span className="text-gray-400 italic font-normal">Not selected</span>}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Second Choice
                            </Label>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                {application.majors.secondChoice && application.majors.secondChoice !== 'none'
                                    ? application.majors.secondChoice
                                    : <span className="text-gray-400 italic font-normal">None</span>}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── WRITING SUPPLEMENTS SECTION ── */}
                <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    {/* Section Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e75e24]/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-[#e75e24]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-bold text-gray-900">Writing Supplements</h2>
                            <p className="text-xs text-gray-400">Essays linked to this application</p>
                        </div>
                        {totalSupplements > 0 && (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${allLinked ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {linkedCount}/{totalSupplements}
                                </span>
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${allLinked ? 'bg-emerald-500' : 'bg-[#e75e24]'}`}
                                        style={{ width: `${totalSupplements > 0 ? Math.round((linkedCount / totalSupplements) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-4 bg-[#faf9f7]/50">
                        {/* Empty state */}
                        {application.supplements.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                    <FileText className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-1">No prompts added by student.</p>
                            </div>
                        )}

                        {/* Supplement cards */}
                        {application.supplements.map((supp, idx) => {
                            const isLinked = supp.linkedDocumentId !== null;
                            const linkedDoc = isLinked
                                ? documents.find((d) => d.id === supp.linkedDocumentId)
                                : null;

                            return (
                                <div
                                    key={supp.id}
                                    className={`group rounded-xl border transition-all duration-200 ${isLinked
                                        ? 'border-emerald-200 bg-emerald-50/30'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    {/* Prompt header */}
                                    <div className="flex items-center gap-3 px-5 py-3.5">
                                        <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-400 flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 text-sm font-semibold text-gray-900 truncate">
                                            {supp.title}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {isLinked ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Linked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold">
                                                    <Circle className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prompt body */}
                                    <div className="px-5 pb-4">
                                        {isLinked ? (
                                            <div className="space-y-3">
                                                {/* Linked document row */}
                                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200/60">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{linkedDoc?.title ?? 'Unknown Document'}</p>
                                                    </div>
                                                    <a
                                                        href={`/dashboard/documents/${supp.linkedDocumentId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto"
                                                    >
                                                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">
                                                            <ExternalLink className="w-3 h-3" />
                                                            Open Document
                                                        </Button>
                                                    </a>
                                                </div>
                                                {/* Preview */}
                                                <DocumentPreview docId={supp.linkedDocumentId as string} />
                                            </div>
                                        ) : (
                                            <div className="w-full py-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-[#faf9f7]">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                                                    <FileText className="w-4 h-4 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    No document linked
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
