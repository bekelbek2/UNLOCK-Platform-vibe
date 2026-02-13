'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProfileDocument } from '@/components/pdf/ProfileDocument';
import { StudentData } from '@/lib/profileStore';

// PDFViewer must be dynamically imported to avoid SSR issues
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-50 border rounded-md">
            <span className="text-gray-500">Loading PDF Preview...</span>
        </div>,
    }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <Button variant="default" disabled>Loading PDF...</Button>,
    }
);

interface ProfilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: StudentData;
}

import { useDocumentStore } from '@/hooks/useDocumentStore';

// ... (dynamic imports)

export function ProfilePreviewModal({ isOpen, onClose, data }: ProfilePreviewModalProps) {
    const { documents } = useDocumentStore();
    const safeFirstName = (data.personal.firstName as string || 'Student').trim();
    const safeLastName = (data.personal.lastName as string || 'Profile').trim();

    // Construct filename: First_Last_Unlock_Application.pdf
    // Ensure no spaces in the name part
    const namePart = `${safeFirstName}_${safeLastName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${namePart}_Unlock_Application.pdf`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle>Profile Preview</DialogTitle>
                    {/* Close button is handled by DialogPrimitive, but we adding title */}
                </DialogHeader>

                <div className="flex-1 bg-gray-100 p-4">
                    <PDFViewer width="100%" height="100%" className="rounded-md border shadow-sm">
                        <ProfileDocument data={data} documents={documents} />
                    </PDFViewer>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-white">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <PDFDownloadLink
                        document={<ProfileDocument data={data} documents={documents} />}
                        fileName={fileName}
                    >
                        {/* @ts-ignore */}
                        {({ blob, url, loading, error }) => (
                            <Button variant="default" className="gap-2" disabled={loading}>
                                <Download className="h-4 w-4" />
                                {loading ? 'Generating...' : 'Download PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
