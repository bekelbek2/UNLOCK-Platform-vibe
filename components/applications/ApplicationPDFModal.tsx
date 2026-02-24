'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Download, Loader2 } from 'lucide-react';
import { Application } from '@/lib/applicationStore';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { ApplicationPDFDocument } from '@/components/pdf/ApplicationPDFDocument';

// ─── Lazy-load PDF primitives (client-only, no SSR) ──────────────────────────
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-md">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading PDF preview…</span>
            </div>
        ),
    }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <Button variant="default" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading…
            </Button>
        ),
    }
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface ApplicationPDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ApplicationPDFModal({
    isOpen,
    onClose,
    application,
}: ApplicationPDFModalProps) {
    const { documents } = useDocumentStore();

    const fileName = `${application.universityName.replace(/\s+/g, '_')}_Application.pdf`;

    const pdfDoc = (
        <ApplicationPDFDocument application={application} documents={documents} />
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
                    <DialogTitle className="text-base font-semibold">
                        Application Preview — {application.universityName}
                    </DialogTitle>
                </DialogHeader>

                {/* PDF Viewer */}
                <div className="flex-1 min-h-0 bg-gray-100 p-4">
                    <PDFViewer width="100%" height="100%" className="rounded-md border shadow-sm">
                        {pdfDoc}
                    </PDFViewer>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-white flex-shrink-0 flex items-center gap-3">
                    <Button variant="outline" onClick={onClose} className="mr-auto">
                        Close
                    </Button>
                    <PDFDownloadLink document={pdfDoc} fileName={fileName}>
                        {/* @ts-ignore */}
                        {({ loading }: { loading: boolean }) => (
                            <Button
                                className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {loading ? 'Generating…' : 'Download PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
