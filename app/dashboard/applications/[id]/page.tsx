'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
    ChevronLeft,
    GraduationCap,
    Building2,
    Calendar,
    FileText,
    Pencil,
    Plus,
    Trash2,
    Link as LinkIcon,
    FileOutput,
    Clock,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useApplicationStore } from '@/lib/applicationStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useProgramStore } from '@/lib/programStore';
import { ApplicationPDFModal } from '@/components/applications/ApplicationPDFModal';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Badge } from '@/components/ui/badge';
import { universities } from '@/data/universities';

// ─── Available Majors ─────────────────────────────────────────────────────────
const MAJORS = [
    'Computer Science',
    'Business Administration',
    'Biology',
    'Psychology',
    'Economics',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Nursing',
    'Law',
    'Medicine',
    'Mathematics',
    'Physics',
    'Undecided',
];

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

// ─── Main Workspace Content ───────────────────────────────────────────────────
function WorkspaceContent() {
    const params = useParams();
    const router = useRouter();
    const appId = params.id as string;

    const { applications, updateMajors, addSupplement, removeSupplement, linkSupplement } =
        useApplicationStore();
    const { documents } = useDocumentStore();

    const application = applications.find((a) => a.id === appId);
    const { programs } = useProgramStore();
    const entityType = application?.entityType ?? 'university';
    const catalogEntry = entityType === 'university'
        ? universities.find((u) => u.id === application?.universityId)
        : programs.find((p) => p.id === application?.universityId);

    // Local state
    const [newSupplementTitle, setNewSupplementTitle] = useState('');
    const [isPDFOpen, setIsPDFOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkingSupplementId, setLinkingSupplementId] = useState<string | null>(null);
    const [selectedDocId, setSelectedDocId] = useState<string>('');

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-gray-500 mb-4">Application not found.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard/applications')}>
                    Return to Applications
                </Button>
            </div>
        );
    }

    const linkedCount = application.supplements.filter((s) => s.linkedDocumentId !== null).length;
    const totalSupplements = application.supplements.length;
    const allLinked = totalSupplements > 0 && linkedCount === totalSupplements;

    // Handlers
    const handleMajorChange = (field: 'firstChoice' | 'secondChoice', val: string) => {
        updateMajors(appId, { ...application.majors, [field]: val });
    };

    const handleAddSupplement = () => {
        if (!newSupplementTitle.trim()) return;
        addSupplement(appId, newSupplementTitle.trim());
        setNewSupplementTitle('');
        toast.success('Supplement prompt added.');
    };

    const openLinkModal = (suppId: string) => {
        setLinkingSupplementId(suppId);
        setSelectedDocId('');
        setIsLinkModalOpen(true);
    };

    const handleSaveLink = () => {
        if (!linkingSupplementId || !selectedDocId) return;
        linkSupplement(appId, linkingSupplementId, selectedDocId);
        toast.success('Document linked!');
        setIsLinkModalOpen(false);
        setLinkingSupplementId(null);
        setSelectedDocId('');
    };

    const handleUnlink = (suppId: string) => {
        linkSupplement(appId, suppId, null);
        toast('Document unlinked.');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Workspace Header ── */}
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
                {/* Breadcrumb */}
                <button
                    onClick={() => router.push('/dashboard/applications')}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Applications
                </button>

                <div className="flex items-start justify-between gap-4">
                    {/* Left: University Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                            {catalogEntry?.logoUrl ? (
                                <img
                                    src={catalogEntry.logoUrl}
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

                    {/* Right: PDF Preview */}
                    <Button
                        onClick={() => setIsPDFOpen(true)}
                        className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2 flex-shrink-0 shadow-sm"
                    >
                        <FileOutput className="w-4 h-4" />
                        Preview as PDF
                    </Button>
                </div>

                {/* Progress strip */}
                {totalSupplements > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 text-right">
                            {linkedCount}/{totalSupplements} linked
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${allLinked ? 'bg-emerald-500' : 'bg-[#e75e24]'
                                    }`}
                                style={{
                                    width: `${Math.round((linkedCount / totalSupplements) * 100)}%`,
                                }}
                            />
                        </div>
                        {allLinked && (
                            <span className="text-xs font-semibold text-emerald-600">
                                All linked ✓
                            </span>
                        )}
                    </div>
                )}
            </header>

            {/* ── Tabs ── */}
            <main className="p-8 max-w-4xl mx-auto">
                <Tabs defaultValue="academics" className="w-full">
                    <TabsList className="h-11 p-1 bg-gray-200/60 rounded-xl mb-8 w-auto inline-flex">
                        <TabsTrigger
                            value="academics"
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            Academics
                        </TabsTrigger>
                        <TabsTrigger
                            value="supplements"
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            Supplements
                            <span
                                className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${allLinked
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}
                            >
                                {totalSupplements}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── ACADEMICS ── */}
                    <TabsContent value="academics">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="w-4.5 h-4.5 text-[#C26E26]" />
                                    Academic Preferences
                                </CardTitle>
                                <CardDescription>
                                    Select your intended majors for {application.universityName}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        First Choice Major
                                    </Label>
                                    <Select
                                        value={application.majors.firstChoice}
                                        onValueChange={(v) => handleMajorChange('firstChoice', v)}
                                    >
                                        <SelectTrigger className="w-full max-w-sm">
                                            <SelectValue placeholder="Select a major…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MAJORS.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        Second Choice Major{' '}
                                        <span className="text-gray-400 font-normal">(Optional)</span>
                                    </Label>
                                    <Select
                                        value={application.majors.secondChoice}
                                        onValueChange={(v) => handleMajorChange('secondChoice', v)}
                                    >
                                        <SelectTrigger className="w-full max-w-sm">
                                            <SelectValue placeholder="Select a major…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {MAJORS.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── SUPPLEMENTS ── */}
                    <TabsContent value="supplements" className="space-y-6">
                        {/* Add Prompt Row */}
                        <div className="flex items-center gap-3 p-4 bg-orange-50/60 border border-orange-100 rounded-xl">
                            <Input
                                placeholder="Prompt title (e.g. Why Us? — 250 words)"
                                value={newSupplementTitle}
                                onChange={(e) => setNewSupplementTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSupplement()}
                                className="bg-white border-orange-100 focus-visible:ring-[#e75e24]"
                            />
                            <Button
                                onClick={handleAddSupplement}
                                className="bg-[#e75e24] hover:bg-[#c24e1b] text-white flex-shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Prompt
                            </Button>
                        </div>

                        {/* Empty State */}
                        {application.supplements.length === 0 && (
                            <div className="p-12 text-center bg-white border border-dashed border-gray-200 rounded-xl">
                                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    No supplement prompts added yet.
                                </p>
                            </div>
                        )}

                        {/* Accordion List */}
                        {application.supplements.length > 0 && (
                            <Accordion
                                type="multiple"
                                defaultValue={application.supplements.map((s) => s.id)}
                                className="space-y-3"
                            >
                                {application.supplements.map((supp) => {
                                    const isLinked = supp.linkedDocumentId !== null;
                                    const linkedDoc = isLinked
                                        ? documents.find((d) => d.id === supp.linkedDocumentId)
                                        : null;

                                    return (
                                        <AccordionItem
                                            key={supp.id}
                                            value={supp.id}
                                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                                        >
                                            {/* Trigger Row */}
                                            <div className="flex items-center px-5 py-3.5 bg-gray-50/50">
                                                <AccordionTrigger className="hover:no-underline py-0 flex-1 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-gray-900 text-sm">
                                                            {supp.title}
                                                        </span>
                                                        {isLinked ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                                                                Linked
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold border border-amber-200">
                                                                Action Required
                                                            </span>
                                                        )}
                                                    </div>
                                                </AccordionTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSupplement(appId, supp.id)}
                                                    className="ml-3 w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Content */}
                                            <AccordionContent className="px-5 pb-5 pt-4 border-t border-gray-100">
                                                {isLinked ? (
                                                    <div className="space-y-4">
                                                        {/* Linked File Banner */}
                                                        <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 leading-tight">
                                                                        {linkedDoc?.title ?? 'Unknown Document'}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400">
                                                                        Linked essay
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs bg-white"
                                                                    onClick={() => openLinkModal(supp.id)}
                                                                >
                                                                    Change
                                                                </Button>
                                                                <Link
                                                                    href={`/dashboard/documents/${supp.linkedDocumentId}`}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs bg-white gap-1"
                                                                    >
                                                                        <Pencil className="w-3 h-3" />
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                    onClick={() => handleUnlink(supp.id)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Preview */}
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                                Preview
                                                            </p>
                                                            <DocumentPreview
                                                                docId={supp.linkedDocumentId as string}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Unlinked State */
                                                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                        <LinkIcon className="w-8 h-8 text-gray-200 mb-3" />
                                                        <p className="font-medium text-gray-900 mb-1 text-sm">
                                                            No Document Linked
                                                        </p>
                                                        <p className="text-xs text-gray-400 mb-5 max-w-xs text-center">
                                                            Select an essay from your Documents workspace to
                                                            use for this prompt.
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openLinkModal(supp.id)}
                                                            className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2"
                                                        >
                                                            <LinkIcon className="w-3.5 h-3.5" />
                                                            Link Document
                                                        </Button>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {/* ── Link Document Modal ── */}
            <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Link Document</DialogTitle>
                        <DialogDescription>
                            Select an essay from your workspace to link to this prompt.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="border rounded-xl overflow-hidden max-h-[260px] overflow-y-auto">
                            {documents.length === 0 ? (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    <FileText className="w-8 h-8 mx-auto text-gray-200 mb-3" />
                                    <p className="mb-4">No documents in your workspace.</p>
                                    <Link href="/dashboard/documents">
                                        <Button variant="outline" size="sm">
                                            Go to Documents
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            onClick={() => setSelectedDocId(doc.id)}
                                            className={`p-4 cursor-pointer flex justify-between items-center transition-colors hover:bg-orange-50 ${selectedDocId === doc.id
                                                ? 'bg-orange-50 border-l-4 border-[#e75e24]'
                                                : 'border-l-4 border-transparent'
                                                }`}
                                        >
                                            <span className="text-sm font-medium text-gray-900 truncate pr-4">
                                                {doc.title}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {new Date(doc.lastModified).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveLink}
                            disabled={!selectedDocId}
                            className="bg-[#e75e24] hover:bg-[#c24e1b] text-white"
                        >
                            Link Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── PDF Preview Modal ── */}
            {isPDFOpen && (
                <ApplicationPDFModal
                    isOpen={isPDFOpen}
                    onClose={() => setIsPDFOpen(false)}
                    application={application}
                />
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApplicationWorkspacePage() {
    return (
        <MainLayout>
            <WorkspaceContent />
        </MainLayout>
    );
}
