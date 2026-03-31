'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    GraduationCap,
    Building2,
    Calendar,
    FileText,
    ExternalLink,
    Clock,
} from 'lucide-react';
import { useApplicationStore, type ApplicationStatus } from '@/lib/applicationStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';

// ─── Status Config ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
    Planning: { label: 'Planning', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Submitted: { label: 'Submitted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// ─── Read-only Document Preview ──────────────────────────────────────
function DocumentPreview({ docId }: { docId: string }) {
    const { getDocument } = useDocumentStore();
    const doc = getDocument(docId);

    const editor = useEditor(
        {
            immediatelyRender: false,
            editable: false,
            extensions: [StarterKit, Highlight.configure({ multicolor: true })],
            content: doc?.content || '',
            editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none' } },
        },
        [doc?.content]
    );

    if (!doc)
        return (
            <div className="p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">Document not found or deleted.</p>
            </div>
        );

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 min-h-[140px] max-h-[280px] overflow-y-auto shadow-inner">
            {editor && <EditorContent editor={editor} />}
        </div>
    );
}

// ─── Main Content ───────────────────────────────────────────────────
export default function AdminApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appId = params.id as string;

    const { applications } = useApplicationStore();
    const { documents } = useDocumentStore();

    const application = applications.find((a) => a.id === appId);
    const uni = application?.university;
    const entityType = application?.entityType ?? 'university';

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">Application not found.</p>
                <Button variant="outline" onClick={() => router.push('/admin/applications')}>
                    Return to Applications
                </Button>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[application.status];
    const linkedCount = application.supplements.filter((s) => s.linkedDocumentId !== null).length;
    const totalSupplements = application.supplements.length;
    const allLinked = totalSupplements > 0 && linkedCount === totalSupplements;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
                <button
                    onClick={() => router.push('/admin/applications')}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Back to Applications
                </button>

                <div className="flex items-start justify-between gap-4">
                    {/* Left: University Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                            {uni?.logo_url ? (
                                <img
                                    src={uni.logo_url}
                                    alt={application.universityName}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) =>
                                        ((e.target as HTMLImageElement).style.display = 'none')
                                    }
                                />
                            ) : (
                                <GraduationCap className="w-7 h-7 text-gray-300" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900 truncate">
                                    {application.universityName}
                                </h1>
                                <Badge
                                    className={`text-[10px] flex-shrink-0 ${entityType === 'program'
                                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                                        : 'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}
                                >
                                    {entityType === 'program' ? 'Program' : 'University'}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <Badge className={`${statusCfg.className} text-xs font-medium px-2.5 py-0.5 border rounded-full`}>
                                    {statusCfg.label}
                                </Badge>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    <Calendar className="w-3 h-3" />
                                    {application.term}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    <Building2 className="w-3 h-3" />
                                    {application.admissionPlan}
                                </span>
                                {application.deadline && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#e75e24] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                                        <Clock className="w-3 h-3" />
                                        {application.deadline}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Read-Only Badge */}
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold px-3 py-1 flex-shrink-0">
                        View Only
                    </Badge>
                </div>

                {/* Progress strip */}
                {totalSupplements > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 text-right">
                            {linkedCount}/{totalSupplements} linked
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${allLinked ? 'bg-emerald-500' : 'bg-[#e75e24]'}`}
                                style={{ width: `${Math.round((linkedCount / totalSupplements) * 100)}%` }}
                            />
                        </div>
                        {allLinked && (
                            <span className="text-xs font-semibold text-emerald-600">All linked ✓</span>
                        )}
                    </div>
                )}
            </header>

            {/* ── Tabs ── */}
            <main className="p-8 max-w-4xl mx-auto">
                <Tabs defaultValue="academics" className="w-full">
                    <TabsList className="h-11 p-1 bg-gray-200/60 rounded-xl mb-8 w-auto inline-flex">
                        <TabsTrigger value="academics" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Academics
                        </TabsTrigger>
                        <TabsTrigger value="supplements" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Supplements
                            <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${allLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {totalSupplements}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── ACADEMICS (Read-Only) ── */}
                    <TabsContent value="academics">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="w-4.5 h-4.5 text-[#C26E26]" />
                                    Academic Preferences
                                </CardTitle>
                                <CardDescription>
                                    Student&apos;s intended majors for {application.universityName}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        First Choice Major
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {application.majors.firstChoice || <span className="text-gray-400 italic font-normal">Not selected</span>}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Second Choice Major
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {application.majors.secondChoice && application.majors.secondChoice !== 'none'
                                            ? application.majors.secondChoice
                                            : <span className="text-gray-400 italic font-normal">None</span>}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── SUPPLEMENTS (Read-Only with Document Links) ── */}
                    <TabsContent value="supplements" className="space-y-4">
                        {application.supplements.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-dashed border-gray-200 rounded-xl">
                                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No supplement prompts added by the student.</p>
                            </div>
                        ) : (
                            application.supplements.map((supp) => {
                                const isLinked = supp.linkedDocumentId !== null;
                                const linkedDoc = isLinked
                                    ? documents.find((d) => d.id === supp.linkedDocumentId)
                                    : null;

                                return (
                                    <Card key={supp.id} className="border-gray-200 shadow-sm overflow-hidden">
                                        {/* Header */}
                                        <CardHeader className="py-3.5 px-5 bg-gray-50/50 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900 text-sm flex-1">{supp.title}</span>
                                                {isLinked ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                                                        Linked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold border border-amber-200">
                                                        Not Linked
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>

                                        {/* Content */}
                                        <CardContent className="p-5">
                                            {isLinked ? (
                                                <div className="space-y-4">
                                                    {/* Linked Doc Banner */}
                                                    <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-lg">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-md bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 leading-tight truncate">
                                                                    {linkedDoc?.title ?? 'Unknown Document'}
                                                                </p>
                                                                <p className="text-[11px] text-gray-400">Linked essay</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`/dashboard/documents/${supp.linkedDocumentId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs bg-white gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 flex-shrink-0"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                Open Document
                                                            </Button>
                                                        </a>
                                                    </div>

                                                    {/* Preview */}
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                            Preview
                                                        </p>
                                                        <DocumentPreview docId={supp.linkedDocumentId as string} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <FileText className="w-8 h-8 text-gray-200 mb-2" />
                                                    <p className="text-sm text-gray-400">No document linked to this prompt yet.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
