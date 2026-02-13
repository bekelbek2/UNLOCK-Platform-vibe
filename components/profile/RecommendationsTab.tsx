'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfileData } from '../../lib/profileStore';
import { useDocumentStore } from '../../hooks/useDocumentStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';

function RecPreview({ docId }: { docId: string }) {
    const { getDocument } = useDocumentStore();
    const doc = getDocument(docId);

    const editor = useEditor({
        immediatelyRender: false,
        editable: false,
        extensions: [
            StarterKit,
            Highlight.configure({ multicolor: true }),
        ],
        content: doc?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none',
            },
        },
    }, [doc?.content]);

    if (!doc) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">Document not found or deleted.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 min-h-[300px]">
                {editor && <EditorContent editor={editor} />}
            </div>
            <div className="flex justify-end">
                <Link href={`/dashboard/documents/${doc.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit Document
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export function RecommendationsTab() {
    const { data, addRecommendation, removeRecommendation } = useProfileData();
    const { documents } = useDocumentStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [selectedDocId, setSelectedDocId] = useState('');

    const handleSave = () => {
        if (!title.trim() || !selectedDocId) return;
        addRecommendation(title, selectedDocId);
        setIsModalOpen(false);
        setTitle('');
        setSelectedDocId('');
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeRecommendation(id);
    };

    // Helper to get doc title for badge
    const getDocTitle = (id: string) => {
        const doc = documents.find(d => d.id === id);
        return doc ? doc.title : 'Unknown Document';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Recommendation Letters</h2>
                    <p className="text-sm text-gray-500">
                        Manage the recommendation letters you have drafted or received.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#D97706] hover:bg-[#B45309]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recommendation
                </Button>
            </div>

            {data.recommendations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No recommendations linked yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Add letters from your counselors, teachers, or other mentors.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} variant="outline">
                        Add Recommendation
                    </Button>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {data.recommendations.map((rec) => (
                        <AccordionItem
                            key={rec.id}
                            value={rec.id}
                            className="bg-white border border-gray-200 rounded-lg px-4"
                        >
                            <div className="flex items-center justify-between w-full py-4">
                                <AccordionTrigger className="hover:no-underline py-0 flex-1">
                                    <div className="flex items-center gap-4 text-left">
                                        <span className="font-medium text-gray-900">{rec.title}</span>
                                        <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100 flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            Linked to: {getDocTitle(rec.linkedDocumentId)}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => handleDelete(e, rec.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <AccordionContent className="pt-2 pb-6 border-t border-gray-100 mt-2">
                                <RecPreview docId={rec.linkedDocumentId} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Add Rec Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Recommendation</DialogTitle>
                        <DialogDescription>
                            Link a document containing your recommendation letter.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Recommender / Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mr. Smith - Math Teacher"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Choose Document</Label>
                            <div className="border rounded-md max-h-[200px] overflow-y-auto">
                                {documents.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No documents found.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                onClick={() => setSelectedDocId(doc.id)}
                                                className={`
                                                    p-3 text-sm cursor-pointer hover:bg-orange-50 transition-colors flex justify-between items-center
                                                    ${selectedDocId === doc.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}
                                                `}
                                            >
                                                <div className="font-medium text-gray-900">{doc.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(doc.lastModified).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim() || !selectedDocId}
                            className="bg-[#D97706] hover:bg-[#B45309]"
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
