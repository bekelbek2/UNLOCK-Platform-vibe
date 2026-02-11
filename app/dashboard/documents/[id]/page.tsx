'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
// Correct import for BubbleMenu based on package.json exports
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import ExtensionBubbleMenu from '@tiptap/extension-bubble-menu';
import { useDocumentStore, DocComment } from '@/hooks/useDocumentStore';
import {
    ChevronLeft,
    Share2,
    Bold,
    Italic,
    List,
    Heading1,
    Heading2,
    Quote,
    MessageSquarePlus,
    User,
    Clock,
    MoreVertical,
    Check,
    FileText,
} from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Simple Avatar Component
function UserAvatar() {
    return (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
            U
        </div>
    );
}

function CommentAvatar({ initial }: { initial: string }) {
    return (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
            {initial}
        </div>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditorProps {
    params: Promise<{
        id: string;
    }>;
}

// ─── Toolbar Component ───────────────────────────────────────────────────────

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-100 text-[#D97706]' : 'text-gray-600'
                    }`}
                title="Quote"
            >
                <Quote size={18} />
            </button>
        </div>
    );
};

// ─── Comment Sidebar Component ───────────────────────────────────────────────

function CommentsSidebar({
    comments,
    isAddingComment,
    newCommentText,
    setNewCommentText,
    onSaveComment,
    onCancelComment,
    activeCommentId,
    setActiveCommentId,
}: {
    comments: DocComment[];
    isAddingComment: boolean;
    newCommentText: string;
    setNewCommentText: (text: string) => void;
    onSaveComment: () => void;
    onCancelComment: () => void;
    activeCommentId: string | null;
    setActiveCommentId: (id: string | null) => void;
}) {
    return (
        <div className="w-80 border-l border-gray-200 bg-white h-full overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Comments</h3>
            </div>

            <div className="flex-1 p-4 space-y-4">
                {/* New Comment Form */}
                {isAddingComment && (
                    <div className="bg-white rounded-lg border border-[#D97706] shadow-sm p-3 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <CommentAvatar initial="Y" />
                            <span className="text-sm font-medium text-gray-900">You</span>
                        </div>
                        <textarea
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Type your comment..."
                            className="w-full text-sm border-none focus:ring-0 p-0 mb-3 resize-none bg-transparent placeholder:text-gray-400"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onCancelComment}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSaveComment}
                                disabled={!newCommentText.trim()}
                                className="px-3 py-1.5 text-xs font-medium bg-[#D97706] text-white rounded-md hover:bg-[#B45309] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                )}

                {/* Comments List */}
                {comments.length === 0 && !isAddingComment ? (
                    <div className="text-center py-8 text-gray-400">
                        <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet</p>
                        <p className="text-xs mt-1">Select text to add a comment</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            onClick={() => setActiveCommentId(comment.id)}
                            className={`rounded-lg border shadow-sm p-3 hover:shadow-md transition-all cursor-pointer ${activeCommentId === comment.id
                                ? 'bg-orange-50 ring-2 ring-[#D97706] border-transparent'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <CommentAvatar initial="U" />
                                    <span className="text-sm font-medium text-gray-900">User</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            {comment.quote && (
                                <div className="pl-2 border-l-2 border-yellow-300 mb-2">
                                    <p className="text-xs text-gray-500 italic line-clamp-2">
                                        "{comment.quote}"
                                    </p>
                                </div>
                            )}
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Main Editor Page ────────────────────────────────────────────────────────

export default function DocumentEditor({ params }: EditorProps) {
    const { id } = use(params);
    const router = useRouter();
    const { getDocument, updateDocument, renameDocument, addComment, syncComments, hydrated } = useDocumentStore();
    const [doc, setDoc] = useState<ReturnType<typeof getDocument>>(undefined);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Commenting state
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [commentRange, setCommentRange] = useState<{ from: number; to: number } | null>(null);
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    // Load document
    useEffect(() => {
        if (!hydrated) return;
        const foundDoc = getDocument(id);
        if (foundDoc) {
            setDoc(foundDoc);
            setTitle(foundDoc.title);
        } else {
            router.push('/dashboard/documents');
        }
    }, [hydrated, id, getDocument, router]);

    // Handle title change
    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (doc) {
            renameDocument(doc.id, newTitle);
        }
    };

    // Initialize Editor
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Highlight.configure({
                multicolor: true,
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        commentId: {
                            default: null,
                            parseHTML: element => element.getAttribute('data-comment-id'),
                            renderHTML: attributes => {
                                if (!attributes.commentId) return {};
                                return {
                                    'data-comment-id': attributes.commentId,
                                };
                            },
                        },
                    };
                },
            }),
            ExtensionBubbleMenu.configure({
                pluginKey: 'bubbleMenu',
            }),
        ],
        content: doc?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none max-w-none min-h-[1056px] px-12 py-12',
                style: 'min-height: 1056px;',
            },
        },
        onSelectionUpdate: ({ editor }) => {
            const { empty } = editor.state.selection;
            if (!empty) return; // Don't change selection while selecting text

            const attrs = editor.getAttributes('highlight');
            if (attrs.commentId) {
                setActiveCommentId(attrs.commentId);
            } else {
                setActiveCommentId(null);
            }
        },
        onUpdate: ({ editor }) => {
            if (!doc) return;
            setIsSaving(true);

            // Garbage Collection: Find all active comment IDs in the document
            const activeCommentIds = new Set<string>();
            editor.state.doc.descendants((node) => {
                if (node.marks) {
                    node.marks.forEach(mark => {
                        if (mark.type.name === 'highlight' && mark.attrs.commentId) {
                            activeCommentIds.add(mark.attrs.commentId);
                        }
                    });
                }
            });

            // Sync with store (remove comments that are no longer in the text)
            // We verify against doc.comments to avoid unnecessary calls? 
            // Better to just let the store handle the diffing logic if possible, 
            // but syncComments is optimized.
            // However, we only simply call it here.
            // Valid constraint: We only want to delete. We don't want to re-add.
            // The store logic I implemented filters based on the passed list.
            // So if I pass specific IDs, it keeps them. If I miss one, it deletes it.
            // This is correct.

            // Wait, onUpdate runs on every keystroke. 
            // Syncing comments on every keystroke might be expensive if many comments.
            // But for a prototype it's fine. 
            // Let's debounce the sync as well?
            // Actually, simple sync is fast enough for < 100 comments.
            // Let's debounce both content save and comment sync.

            const content = editor.getJSON();

            // Debounce save
            const timeoutId = setTimeout(() => {
                updateDocument(doc.id, content as Record<string, unknown>);
                syncComments(doc.id, Array.from(activeCommentIds));
                setIsSaving(false);
            }, 1000);
            return () => clearTimeout(timeoutId);
        },
    });

    // Update editor content if doc changes externally (e.g. initial load)
    useEffect(() => {
        if (editor && doc?.content && editor.isEmpty) {
            editor.commands.setContent(doc.content);
        }
    }, [doc?.content, editor]);

    // Handle Commenting Flow
    const handleAddCommentClick = () => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        if (empty) return;

        const text = editor.state.doc.textBetween(from, to);
        setSelectedText(text);
        setCommentRange({ from, to });

        // Highlight with a temporary color to show selection, but ID is added on Save
        // Actually, we should probably just highlight it yellow now
        editor.chain().focus().setHighlight({ color: '#facc15' }).run();

        setIsAddingComment(true);
    };

    const handleSaveComment = () => {
        if (!doc || !commentText.trim() || !editor || !commentRange) return;

        const newCommentId = Date.now().toString();

        // Add to Store
        addComment(doc.id, {
            id: newCommentId,
            text: commentText,
            quote: selectedText,
            date: new Date().toISOString(),
        });

        // Add Highlight with ID to Editor
        editor.chain().focus()
            .setTextSelection(commentRange)
            // @ts-ignore
            // @ts-ignore
            .setHighlight({ color: '#fef08a', commentId: newCommentId })
            .run();

        setIsAddingComment(false);
        setCommentText('');
        setSelectedText('');
        setCommentRange(null);
    };

    const handleCancelComment = () => {
        // Remove highlight if cancelled
        if (editor && commentRange) {
            editor.chain().focus()
                .setTextSelection(commentRange)
                .unsetHighlight()
                .run();
        }

        setIsAddingComment(false);
        setCommentText('');
        setSelectedText('');
        setCommentRange(null);
    };

    const handleDownload = async () => {
        if (!editor) return;

        try {
            // Dynamic imports for client-side libraries
            const { asBlob } = await import('html-docx-js-typescript');
            const { saveAs } = (await import('file-saver')).default;

            const htmlContent = editor.getHTML();
            const fullHtml = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${title}</title>
                </head>
                <body>
                    ${htmlContent}
                </body>
                </html>`;

            const blob = await asBlob(fullHtml);
            saveAs(blob as Blob, `${title || 'document'}.docx`);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    if (!hydrated || !doc) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-[#F3F4F6] overflow-hidden">
            <style>{`
                .ProseMirror hr {
                    border: none;
                    border-top: 2px dashed #e5e7eb;
                    margin: 2rem 0;
                    position: relative;
                }
                /* Default Highlight Color (Lighter Yellow) */
                mark[data-comment-id] {
                    background-color: #fef08a !important; 
                    color: black;
                }
                .ProseMirror p.is-editor-empty:first-child::before {               }
                .ProseMirror hr::after {
                    content: 'Page Break';
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 0 8px;
                    color: #9ca3af;
                    font-size: 12px;
                    font-weight: 500;
                }
                ${activeCommentId ? `
                    mark[data-comment-id="${activeCommentId}"] {
                        background-color: #fbbf24 !important;
                        color: black;
                        border-bottom: 2px solid #d97706;
                    }
                ` : ''}
            `}</style>

            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => router.push('/dashboard/documents')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <FileText className="text-[#D97706]" size={24} />
                        <div className="flex flex-col">
                            <input
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="text-lg font-medium text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-400 bg-transparent"
                                placeholder="Untitled document"
                            />
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                {isSaving ? (
                                    <>
                                        <Clock size={10} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={10} />
                                        Saved to localStorage
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full font-medium text-sm transition-colors shadow-sm"
                    >
                        <FileText size={16} />
                        Download
                    </button>
                    <UserAvatar />
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-full font-medium text-sm transition-colors shadow-sm">
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </header>

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto relative block p-8">
                    {/* Toolbar */}
                    <div className="sticky top-0 z-30 mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <MenuBar editor={editor} />
                    </div>

                    {/* Paper */}
                    <div className="w-full max-w-[850px] bg-white min-h-[297mm] h-auto shadow-lg border border-gray-200 mx-auto transition-transform pb-24 overflow-visible">
                        {editor && (
                            <BubbleMenu
                                editor={editor}
                                shouldShow={({ editor }) => {
                                    // Only show if selection is not empty and not already highlighted (optional)
                                    return !editor.state.selection.empty;
                                }}
                            >
                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-1 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={handleAddCommentClick}
                                        className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <MessageSquarePlus size={14} className="text-[#D97706]" />
                                        Add Comment
                                    </button>
                                </div>
                            </BubbleMenu>
                        )}
                        <EditorContent editor={editor} className="w-full" />
                    </div>
                    <div className="h-20" /> {/* Bottom spacer */}
                </main>

                {/* Right Sidebar - Comments */}
                <CommentsSidebar
                    comments={doc.comments}
                    isAddingComment={isAddingComment}
                    newCommentText={commentText}
                    setNewCommentText={setCommentText}
                    onSaveComment={handleSaveComment}
                    onCancelComment={handleCancelComment}
                    activeCommentId={activeCommentId}
                    setActiveCommentId={setActiveCommentId}
                />
            </div>
        </div>
    );
}
