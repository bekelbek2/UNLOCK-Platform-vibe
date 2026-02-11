'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import {
    Plus,
    FileText,
    MoreVertical,
    Pencil,
    Trash2,
    Clock,
} from 'lucide-react';

function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── 3-dot Menu ──────────────────────────────────────────────────────────────

function DocMenu({
    onRename,
    onDelete,
}: {
    onRename: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onRename();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                        <Pencil size={14} />
                        Rename
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Rename Dialog ───────────────────────────────────────────────────────────

function RenameDialog({
    currentTitle,
    onSave,
    onCancel,
}: {
    currentTitle: string;
    onSave: (title: string) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(currentTitle);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename document</h3>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && title.trim() && onSave(title.trim())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent text-sm"
                    autoFocus
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => title.trim() && onSave(title.trim())}
                        className="px-4 py-2 text-sm bg-[#D97706] text-white rounded-lg hover:bg-[#B45309] transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsDashboard() {
    const router = useRouter();
    const { documents, hydrated, createDocument, renameDocument, deleteDocument } = useDocumentStore();
    const [renamingId, setRenamingId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = () => {
        const id = createDocument();
        router.push(`/dashboard/documents/${id}`);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const mammoth = (await import('mammoth')).default; // Dynamic import
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;
            const title = file.name.replace(/\.docx?$/, '') || 'Imported Document';

            const id = createDocument(html, title);
            router.push(`/dashboard/documents/${id}`);
        } catch (error) {
            console.error("Import failed:", error);
            // In a real app, show a toast here
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renamingDoc = documents.find((d) => d.id === renamingId);

    if (!hydrated) {
        return (
            <MainLayout>
                <Header title="Documents" subtitle="Write and manage your essays and documents." />
                <div className="p-8 bg-gray-50 min-h-[calc(100vh-120px)] flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading…</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Header title="Documents" subtitle="Write and manage your essays and documents." />

            <div className="p-8 bg-gray-50 min-h-[calc(100vh-120px)]">
                {/* Section A: Start a new document */}
                <section className="mb-10">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                        Start a new document
                    </h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleCreate}
                            className="group w-[164px] h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#D97706] hover:bg-amber-50/30 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-[#D97706]/10 flex items-center justify-center mb-3 transition-colors">
                                <Plus className="w-7 h-7 text-gray-400 group-hover:text-[#D97706] transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-[#D97706] transition-colors">
                                Blank document
                            </span>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group w-[164px] h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-blue-500/10 flex items-center justify-center mb-3 transition-colors">
                                <FileText className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-500 transition-colors">
                                Upload Word File
                            </span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".docx"
                            className="hidden"
                        />
                    </div>
                </section>

                {/* Section B: Recent documents */}
                {documents.length > 0 && (
                    <section>
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                            Recent documents
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                                    className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group overflow-hidden"
                                >
                                    {/* Preview area */}
                                    <div className="h-[140px] bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                                        <FileText className="w-10 h-10 text-gray-300" />
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-1">
                                            <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                                                {doc.title}
                                            </h3>
                                            <DocMenu
                                                onRename={() => setRenamingId(doc.id)}
                                                onDelete={() => deleteDocument(doc.id)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                                            <Clock size={12} />
                                            <span>{formatDate(doc.lastModified)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {documents.length === 0 && (
                    <section className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">No documents yet</h3>
                        <p className="text-sm text-gray-400">
                            Click "Blank document" above to create your first essay.
                        </p>
                    </section>
                )}
            </div>

            {/* Rename Dialog */}
            {renamingDoc && (
                <RenameDialog
                    currentTitle={renamingDoc.title}
                    onSave={(title) => {
                        renameDocument(renamingDoc.id, title);
                        setRenamingId(null);
                    }}
                    onCancel={() => setRenamingId(null)}
                />
            )}
        </MainLayout>
    );
}
