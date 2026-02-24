import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import { Application } from '@/lib/applicationStore';
import { Document as AppDocument } from '@/hooks/useDocumentStore';

// ─── Font ─────────────────────────────────────────────────────────────────────
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2' },
        {
            src: 'https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdr.woff2',
            fontWeight: 'bold',
        },
    ],
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    page: {
        backgroundColor: '#fdf8ec',
        paddingTop: 48,
        paddingBottom: 60,
        paddingHorizontal: 50,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.6,
        color: '#1a1a1a',
    },
    // Header
    header: {
        marginBottom: 24,
        paddingBottom: 14,
        borderBottomWidth: 3,
        borderBottomColor: '#C26E26',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#C26E26',
        marginBottom: 4,
    },
    headerMeta: {
        fontSize: 10,
        color: '#666',
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    headerMetaItem: {
        marginRight: 16,
    },
    // Section
    section: {
        marginBottom: 22,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#C26E26',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e8d5bc',
    },
    // Table / Key-value
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0e8d8',
    },
    rowLabel: {
        width: '40%',
        fontWeight: 'bold',
        color: '#555',
    },
    rowValue: {
        flex: 1,
        color: '#1a1a1a',
    },
    // Supplement block
    supplementBlock: {
        marginBottom: 16,
        backgroundColor: '#fff9f0',
        borderRadius: 6,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#C26E26',
    },
    supplementTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    supplementBody: {
        fontSize: 9.5,
        color: '#555',
        lineHeight: 1.7,
    },
    notLinked: {
        fontSize: 9.5,
        color: '#999',
        fontStyle: 'italic',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 50,
        right: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#aaa',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 6,
    },
});

// ─── Helper: extract plain text from TipTap JSON ──────────────────────────────
function tiptapToText(content: unknown): string {
    if (!content) return '';
    if (typeof content === 'string') {
        // Strip basic HTML tags if stored as HTML
        return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    // TipTap JSON node
    const node = content as { type?: string; text?: string; content?: unknown[] };
    if (node.text) return node.text;
    if (node.content && Array.isArray(node.content)) {
        return node.content.map(tiptapToText).join(' ');
    }
    return '';
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ApplicationPDFDocumentProps {
    application: Application;
    documents: AppDocument[];
}

// ─── Document ─────────────────────────────────────────────────────────────────
export function ApplicationPDFDocument({
    application,
    documents,
}: ApplicationPDFDocumentProps) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Document
            title={`Application — ${application.universityName}`}
            author="UNLOCK Platform"
        >
            <Page size="A4" style={S.page}>
                {/* ── Header ── */}
                <View style={S.header}>
                    <Text style={S.headerTitle}>
                        Application Summary — {application.universityName}
                    </Text>
                    <View style={S.headerMeta}>
                        <Text style={S.headerMetaItem}>Term: {application.term}</Text>
                        <Text style={S.headerMetaItem}>Plan: {application.admissionPlan}</Text>
                        <Text style={S.headerMetaItem}>Deadline: {application.deadline}</Text>
                        <Text style={S.headerMetaItem}>Status: {application.status}</Text>
                    </View>
                </View>

                {/* ── Section 1: Academics ── */}
                <View style={S.section}>
                    <Text style={S.sectionTitle}>Academics</Text>
                    <View style={S.row}>
                        <Text style={S.rowLabel}>First Choice Major</Text>
                        <Text style={S.rowValue}>
                            {application.majors.firstChoice || 'Not selected'}
                        </Text>
                    </View>
                    <View style={S.row}>
                        <Text style={S.rowLabel}>Second Choice Major</Text>
                        <Text style={S.rowValue}>
                            {application.majors.secondChoice && application.majors.secondChoice !== 'none'
                                ? application.majors.secondChoice
                                : 'Not selected'}
                        </Text>
                    </View>
                </View>

                {/* ── Section 2: Writing Supplements ── */}
                <View style={S.section}>
                    <Text style={S.sectionTitle}>
                        Writing Supplements ({application.supplements.length})
                    </Text>

                    {application.supplements.length === 0 ? (
                        <Text style={S.notLinked}>No supplements added for this application.</Text>
                    ) : (
                        application.supplements.map((supp) => {
                            const doc = supp.linkedDocumentId
                                ? documents.find((d) => d.id === supp.linkedDocumentId)
                                : null;

                            const bodyText = doc
                                ? tiptapToText(doc.content).trim() || '(Empty document)'
                                : null;

                            return (
                                <View key={supp.id} style={S.supplementBlock}>
                                    <Text style={S.supplementTitle}>{supp.title}</Text>
                                    {bodyText ? (
                                        <Text style={S.supplementBody}>{bodyText}</Text>
                                    ) : (
                                        <Text style={S.notLinked}>
                                            Status: Not Linked — no document has been assigned to this prompt.
                                        </Text>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>

                {/* ── Footer ── */}
                <View style={S.footer} fixed>
                    <Text>UNLOCK Platform — Confidential</Text>
                    <Text>Generated on {today}</Text>
                </View>
            </Page>
        </Document>
    );
}
