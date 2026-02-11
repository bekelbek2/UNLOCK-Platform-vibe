'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DocComment {
    id: string;
    text: string;
    quote: string;
    date: string;
}

export interface Document {
    id: string;
    title: string;
    content: Record<string, unknown> | string | null; // TipTap JSON or HTML string
    lastModified: string;
    comments: DocComment[];
}

interface DocumentStore {
    documents: Document[];
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'unlock_documents';

const defaultStore: DocumentStore = {
    documents: [],
};

function loadFromStorage(): DocumentStore {
    if (typeof window === 'undefined') return defaultStore;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultStore;
        const parsed = JSON.parse(raw);
        return { ...defaultStore, ...parsed };
    } catch {
        return defaultStore;
    }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDocumentStore() {
    const [store, setStore] = useState<DocumentStore>(defaultStore);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setStore(loadFromStorage());
        setHydrated(true);
    }, []);

    // Persist on every change
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch {
            // Storage full — silent fail
        }
    }, [store, hydrated]);

    const createDocument = useCallback((initialContent: Record<string, unknown> | string | null = null, initialTitle: string = 'Untitled document'): string => {
        const id = Date.now().toString();
        const newDoc: Document = {
            id,
            title: initialTitle,
            content: initialContent,
            lastModified: new Date().toISOString(),
            comments: [],
        };
        setStore((prev) => ({
            ...prev,
            documents: [newDoc, ...prev.documents],
        }));
        return id;
    }, []);

    const updateDocument = useCallback((id: string, content: Record<string, unknown>) => {
        setStore((prev) => ({
            ...prev,
            documents: prev.documents.map((doc) =>
                doc.id === id
                    ? { ...doc, content, lastModified: new Date().toISOString() }
                    : doc
            ),
        }));
    }, []);

    const renameDocument = useCallback((id: string, title: string) => {
        setStore((prev) => ({
            ...prev,
            documents: prev.documents.map((doc) =>
                doc.id === id
                    ? { ...doc, title, lastModified: new Date().toISOString() }
                    : doc
            ),
        }));
    }, []);

    const deleteDocument = useCallback((id: string) => {
        setStore((prev) => ({
            ...prev,
            documents: prev.documents.filter((doc) => doc.id !== id),
        }));
    }, []);

    const addComment = useCallback((docId: string, comment: Omit<DocComment, 'id'> & { id?: string }) => {
        const newComment: DocComment = {
            id: comment.id || Date.now().toString(),
            text: comment.text,
            quote: comment.quote,
            date: comment.date
        };
        setStore((prev) => ({
            ...prev,
            documents: prev.documents.map((doc) =>
                doc.id === docId
                    ? { ...doc, comments: [...doc.comments, newComment] }
                    : doc
            ),
        }));
    }, []);

    const getDocument = useCallback((id: string): Document | undefined => {
        return store.documents.find((doc) => doc.id === id);
    }, [store.documents]);

    const syncComments = useCallback((docId: string, activeCommentIds: string[]) => {
        setStore((prev) => ({
            ...prev,
            documents: prev.documents.map((doc) => {
                if (doc.id !== docId) return doc;

                // Filter out comments that are not in the active list
                const newComments = doc.comments.filter(comment =>
                    activeCommentIds.includes(comment.id)
                );

                // Only update if length changed to avoid unnecessary re-renders
                if (newComments.length === doc.comments.length) return doc;

                return { ...doc, comments: newComments };
            }),
        }));
    }, []);

    return {
        documents: store.documents,
        hydrated,
        createDocument,
        updateDocument,
        renameDocument,
        deleteDocument,
        addComment,
        getDocument,
        syncComments,
    };
}
