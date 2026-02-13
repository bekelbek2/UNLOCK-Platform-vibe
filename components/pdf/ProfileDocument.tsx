import React from 'react';
import { Page, Text, View, Document as PdfDocument, StyleSheet, Font, Image as PdfImage } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { StudentData } from '@/lib/profileStore';
import { Document as AppDocument } from '@/hooks/useDocumentStore';

// Register fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/0.ttf' },
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/0.ttf', fontWeight: 'bold' },
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/0.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fdf8ec', // Brand Cream
        paddingTop: 40,
        paddingBottom: 65,
        paddingHorizontal: 45,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#0f0f0f',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#e75e24', // Brand Orange
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e75e24', // Brand Orange
        marginBottom: 5,
    },
    headerSub: {
        fontSize: 10,
        color: '#666666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#e75e24', // Brand Orange
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 2,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
        color: '#000000',
    },
    value: {
        width: '70%',
        color: '#000000',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 5,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
        width: '100%',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#cccccc',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 4,
    },
    tableCell: {
        fontSize: 9,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        color: '#000000',
        fontWeight: 'bold',
    },
    activityItem: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e6e6e6',
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    activityTitle: {
        fontWeight: 'bold',
        fontSize: 11,
        color: '#e75e24',
    },
    activityOrg: {
        fontStyle: 'italic',
        color: '#555',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bullet: {
        width: 10,
        fontSize: 10,
        color: '#e75e24',
    },
    documentContent: {
        marginTop: 4,
        marginBottom: 12,
        fontSize: 10,
        color: '#333',
        textAlign: 'justify',
    },
    documentTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#e75e24',
        backgroundColor: '#F3F0E6', // Muted accent
        padding: 2,
    },
});

interface ProfileDocumentProps {
    data: StudentData;
    documents?: AppDocument[];
}

// Helper to safely get string values
const getString = (val: unknown) => (typeof val === 'string' ? val : '');
const getNumber = (val: unknown) => (typeof val === 'number' ? val.toString() : '');

// Helper to strip HTML tags and comments
const stripHtml = (content: unknown): string => {
    if (typeof content !== 'string') return '';

    // Replace <p> and </div> with double newline for paragraphs
    let text = content.replace(/<\/p>/g, '\n\n').replace(/<\/div>/g, '\n\n');

    // Replace <br> with newline
    text = text.replace(/<br\s*\/?>/g, '\n');

    // Strip all HTML tags (including <mark> for comments)
    text = text.replace(/<[^>]+>/g, '');

    // Decode basic entities (optional, but good for common ones)
    text = text.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

    return text.trim();
};

// Helper to extract text from TipTap JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTextFromJson = (node: any): string => {
    if (!node) return '';
    if (typeof node !== 'object') return '';

    if (node.type === 'text' && typeof node.text === 'string') {
        return node.text;
    }

    let childrenText = '';
    if (node.content && Array.isArray(node.content)) {
        childrenText = node.content.map(getTextFromJson).join('');
    }

    // Add spacing for paragraphs
    if (node.type === 'paragraph') {
        return childrenText + '\n\n';
    }

    return childrenText;
};

export const ProfileDocument: React.FC<ProfileDocumentProps> = ({ data, documents = [] }) => {
    // Destructure specifically to avoid "any" implicit issues if possible, although data is typed
    const { personal, family, education, testScores, activities, honors, essays, recommendations, finance } = data;

    const fullName = `${getString(personal.firstName)} ${getString(personal.lastName)}`.trim() || 'Student Profile';
    const currentDate = format(new Date(), 'MMMM d, yyyy');

    // Helper to find document content
    const getDocumentContent = (linkedId: string) => {
        const doc = documents.find(d => d.id === linkedId);
        if (!doc || !doc.content) return '';

        if (typeof doc.content === 'string') {
            return stripHtml(doc.content);
        }

        if (typeof doc.content === 'object') {
            return getTextFromJson(doc.content).trim();
        }

        return '';
    };

    return (
        <PdfDocument>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header} fixed>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <PdfImage
                            src="/unlockorg.png"
                            style={{ width: 120, height: 35, objectFit: 'contain' }}
                        />
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10, color: '#000' }}>Unlock Application</Text>
                            <Text style={{ fontSize: 10, color: '#000' }}>{currentDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Main Profile Title */}
                <Text style={styles.headerTitle}>Profile</Text>

                {/* Section 1: Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name:</Text>
                        <Text style={styles.value}>{fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date of Birth:</Text>
                        <Text style={styles.value}>
                            {personal.dateOfBirth ? format(new Date(personal.dateOfBirth as string), 'MMMM d, yyyy') : '-'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{getString(personal.phoneNumber)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>
                            {[personal.streetName, personal.city, personal.stateProvince, personal.zipCode, personal.country]
                                .filter(Boolean)
                                .join(', ')}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Demographics:</Text>
                        <Text style={styles.value}>
                            {[getString(personal.gender), getString(personal.ethnicity)].filter(Boolean).join(' • ')}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Citizenship:</Text>
                        <Text style={styles.value}>
                            {Array.isArray(personal.countriesOfCitizenship) ? personal.countriesOfCitizenship.join(', ') : getString(personal.countryOfBirth)}
                        </Text>
                    </View>
                </View>

                {/* Section 2: Education */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>High School:</Text>
                        <Text style={styles.value}>{getString(education.highSchoolName)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>School Type:</Text>
                        <Text style={styles.value}>{getString(education.schoolType)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Graduation:</Text>
                        <Text style={styles.value}>
                            {getString(education.graduationMonth)} {getString(education.graduationYear)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>GPA:</Text>
                        <Text style={styles.value}>
                            {getNumber(education.cumulativeGpa)} / {getString(education.gpaScale)} ({getString(education.gpaType)})
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Class Rank:</Text>
                        <Text style={styles.value}>{getString(education.classRank)} (Class Size: {getNumber(education.classSize)})</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Future Plans:</Text>
                        <Text style={styles.value}>
                            {getString(education.highestDegree)} - {getString(education.careerInterest)}
                        </Text>
                    </View>
                </View>

                {/* Section 3: Standardized Tests */}
                {testScores && testScores.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Standardized Tests</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Test Type</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Date</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Total Score</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>Breakdown</Text></View>
                            </View>
                            {testScores.map((score, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{getString(score.testType)}</Text></View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {score.testDate ? format(new Date(score.testDate as string), 'MM/yyyy') : '-'}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{getNumber(score.totalScore)}</Text></View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {Object.entries(score)
                                                .filter(([k]) => k !== 'testType' && k !== 'testDate' && k !== 'totalScore' && k !== 'id')
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join('\n')}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Section 4: Family */}
                {/* Section 4: Family */}
                {/* Detailed family breakdown including Household, Parents, and Siblings */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Family</Text>

                    {/* Household Info */}
                    {(getString(family.maritalStatus) || getString(family.permanentResidence)) && (
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 4, color: '#e75e24' }}>Household</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Parents' Marital Status:</Text>
                                <Text style={styles.value}>{getString(family.maritalStatus)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Permanent Residence:</Text>
                                <Text style={styles.value}>{getString(family.permanentResidence)}</Text>
                            </View>
                            {getString(family.hasChildren) === 'yes' && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Children:</Text>
                                    <Text style={styles.value}>{getNumber(family.numberOfChildren)}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Parents */}
                    {[1, 2].map(num => {
                        const parent = (family as any)[`parent${num}`];
                        if (!parent?.firstName) return null;

                        return (
                            <View key={num} style={{ marginBottom: 12 }} wrap={false}>
                                <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 4, color: '#e75e24' }}>
                                    Parent {num}
                                </Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Name:</Text>
                                    <Text style={styles.value}>{getString(parent.firstName)} {getString(parent.lastName)}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Relationship:</Text>
                                    <Text style={styles.value}>
                                        {getString(parent.relationship)}
                                        {parent.isLiving ? ` (${getString(parent.isLiving) === 'yes' ? 'Living' : 'Deceased'})` : ''}
                                    </Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Contact:</Text>
                                    <Text style={styles.value}>{getString(parent.phoneNumber)}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Occupation:</Text>
                                    <Text style={styles.value}>{getString(parent.occupation)}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Education:</Text>
                                    <Text style={styles.value}>{getString(parent.educationLevel)}</Text>
                                </View>
                            </View>
                        );
                    })}

                    {/* Siblings */}
                    {Array.isArray(family.siblings) && family.siblings.length > 0 && (
                        <View wrap={false}>
                            <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 4, color: '#e75e24' }}>Siblings</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Total Siblings:</Text>
                                <Text style={styles.value}>{getNumber(family.numberOfSiblings)}</Text>
                            </View>
                            {family.siblings.map((sib: any, idx: number) => (
                                <View key={idx} style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={{ fontSize: 10 }}>
                                        {sib.fullName} (Age: {sib.age})
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Section 5: Honors */}
                {honors && honors.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Honors & Awards</Text>
                        {honors.map((honor, index) => (
                            <View key={index} style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{honor.title}</Text>
                                    <Text style={{ fontSize: 9, color: '#555' }}>
                                        Grade Levels: {honor.gradeLevels.join(', ')} | Recognition: {honor.recognitionLevels.join(', ')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Section 6: Activities */}
                {activities && activities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Activities</Text>
                        {activities.map((activity, index) => (
                            <View key={index} style={styles.activityItem} wrap={false}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.activityTitle}>
                                        {activity.position || 'Member'}, {activity.organizationName}
                                    </Text>
                                    <Text style={{ fontSize: 9 }}>
                                        {activity.gradeLevels.join(', ')}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 2 }}>
                                    {activity.activityType} | {activity.hoursPerWeek} hrs/wk, {activity.weeksPerYear} wks/yr
                                </Text>
                                <Text style={{ fontSize: 9 }}>{activity.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Section 7: Writing */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Writing & Recommendations</Text>

                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 6 }}>Essays</Text>
                        {essays && essays.length > 0 ? (
                            essays.map((essay, index) => {
                                const content = getDocumentContent(essay.linkedDocumentId);
                                return (
                                    <View key={index} style={{ marginBottom: 8 }}>
                                        <Text style={styles.documentTitle}>{essay.title}</Text>
                                        {content ? (
                                            <Text style={styles.documentContent}>{content}</Text>
                                        ) : (
                                            <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666' }}>
                                                [No content or linked document found]
                                            </Text>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={{ fontSize: 9, fontStyle: 'italic', marginLeft: 10 }}>No essays added.</Text>
                        )}
                    </View>

                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 6 }}>Recommendation Letters</Text>
                        {recommendations && recommendations.length > 0 ? (
                            recommendations.map((rec, index) => {
                                const content = getDocumentContent(rec.linkedDocumentId);
                                return (
                                    <View key={index} style={{ marginBottom: 8 }}>
                                        <Text style={styles.documentTitle}>{rec.title}</Text>
                                        {content ? (
                                            <Text style={styles.documentContent}>{content}</Text>
                                        ) : (
                                            <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666' }}>
                                                [No content or linked document found]
                                            </Text>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={{ fontSize: 9, fontStyle: 'italic', marginLeft: 10 }}>No recommendations added.</Text>
                        )}
                    </View>
                </View>

                {/* Section 8: Finance */}
                {Object.keys(finance).length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Financial Information</Text>
                        {Object.entries(finance).map(([key, value]) => (
                            <View key={key} style={styles.row}>
                                <Text style={styles.label}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
                                </Text>
                                <Text style={styles.value}>
                                    {typeof value === 'number' ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('.00', '') : (value ? String(value) : '-')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </PdfDocument>
    );
};
