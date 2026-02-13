import { useState } from 'react';
import { DocComment } from '@/hooks/useDocumentStore';
import { MessageSquare, CornerDownRight, Send, Trash2 } from 'lucide-react';

function CommentAvatar({ initial, size = "md" }: { initial: string, size?: "sm" | "md" }) {
    const sizeClasses = size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs";
    return (
        <div className={`${sizeClasses} rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shrink-0`}>
            {initial}
        </div>
    );
}

interface CommentItemProps {
    comment: DocComment;
    docId: string;
    isActive: boolean;
    onClick: () => void;
    onDelete: (commentId: string) => void;
    onReply: (commentId: string, text: string) => void;
}

export function CommentItem({ comment, docId, isActive, onClick, onDelete, onReply }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering onClick of the card

        if (!replyText.trim()) return;

        onReply(comment.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(comment.id);
    };

    const toggleReply = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsReplying(!isReplying);
    };

    return (
        <div
            onClick={onClick}
            className={`rounded-lg border shadow-sm p-3 transition-all cursor-pointer ${isActive
                ? 'bg-orange-50 ring-2 ring-[#D97706] border-transparent'
                : 'bg-white border-gray-200 hover:shadow-md'
                }`}
        >
            {/* Main Comment Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <CommentAvatar initial={comment.author?.[0] || "U"} />
                    <span className="text-sm font-medium text-gray-900">{comment.author || "User"}</span>
                    <span className="text-xs text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                    </span>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                    title="Delete comment"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Quote Reference */}
            {comment.quote && (
                <div className="pl-2 border-l-2 border-yellow-300 mb-2">
                    <p className="text-xs text-gray-500 italic line-clamp-2">
                        "{comment.quote}"
                    </p>
                </div>
            )}

            {/* Comment Text */}
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{comment.text}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={toggleReply}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#D97706] transition-colors"
                >
                    <CornerDownRight size={12} />
                    Reply
                </button>
            </div>

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 ml-4 space-y-2">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-md p-2 border border-gray-100 flex items-start gap-2">
                            <CommentAvatar initial={reply.author?.[0] || "U"} size="sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-medium text-gray-900">{reply.author}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(reply.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                                    {reply.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Input */}
            {isReplying && (
                <div className="mt-3 pl-3 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleReply}>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full text-xs p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D97706] mb-2 resize-none bg-gray-50"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsReplying(false)}
                                className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-[#D97706] text-white rounded hover:bg-[#B45309] disabled:opacity-50"
                            >
                                <Send size={10} />
                                Reply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
