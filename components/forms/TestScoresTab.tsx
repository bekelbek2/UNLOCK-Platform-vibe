'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Constants
const TEST_TYPES = ['IELTS', 'SAT', 'ACT', 'AP', 'TOEFL', 'Duolingo English Test', 'Other'] as const;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));

const AP_SUBJECTS = [
    'African American Studies',
    'Art and Design: 2-D Design',
    'Art and Design: 3-D Design',
    'Art and Design: Drawing',
    'Art History',
    'Biology',
    'Calculus AB',
    'Calculus BC',
    'Chemistry',
    'Chinese Language and Culture',
    'Comparative Government and Politics',
    'Computer Science A',
    'Computer Science Principles',
    'English Language and Composition',
    'English Literature and Composition',
    'Environmental Science',
    'European History',
    'French Language and Culture',
    'German Language and Culture',
    'Government and Politics: United States',
    'Human Geography',
    'Italian Language and Culture',
    'Japanese Language and Culture',
    'Latin',
    'Macroeconomics',
    'Microeconomics',
    'Music Theory',
    'Physics 1: Algebra-Based',
    'Physics 2: Algebra-Based',
    'Physics C: Electricity and Magnetism',
    'Physics C: Mechanics',
    'Precalculus',
    'Psychology',
    'Research',
    'Seminar',
    'Spanish Language and Culture',
    'Spanish Literature and Culture',
    'Statistics',
    'World History: Modern',
];

// Schema
const testScoreSchema = z.object({
    testType: z.string().min(1, 'Select a test type'),
    month: z.string().min(1, 'Select month'),
    year: z.string().min(1, 'Select year'),
    // IELTS / TOEFL scores
    listening: z.coerce.number().optional(),
    reading: z.coerce.number().optional(),
    writing: z.coerce.number().optional(),
    speaking: z.coerce.number().optional(),
    // SAT scores
    satReadingWriting: z.coerce.number().optional(),
    satMath: z.coerce.number().optional(),
    // ACT scores
    actEnglish: z.coerce.number().optional(),
    actMath: z.coerce.number().optional(),
    actReading: z.coerce.number().optional(),
    actScience: z.coerce.number().optional(),
    actComposite: z.coerce.number().optional(),
    // Duolingo
    duolingoScore: z.coerce.number().optional(),
    // AP
    apSubject: z.string().optional(),
    apScore: z.coerce.number().min(1).max(5).optional(),
    // Other
    otherTestName: z.string().optional(),
    otherScore: z.string().optional(),
});

type TestScoreFormData = z.infer<typeof testScoreSchema>;

interface TestScore extends TestScoreFormData {
    id: string;
    displayScore: string;
}

export default function TestScoresTab() {
    const [testScores, setTestScores] = useState<TestScore[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<TestScoreFormData>({
        resolver: zodResolver(testScoreSchema),
        defaultValues: {
            testType: '',
            month: '',
            year: '',
            listening: undefined,
            reading: undefined,
            writing: undefined,
            speaking: undefined,
            satReadingWriting: undefined,
            satMath: undefined,
            actEnglish: undefined,
            actMath: undefined,
            actReading: undefined,
            actScience: undefined,
            actComposite: undefined,
            duolingoScore: undefined,
            apSubject: '',
            apScore: undefined,
            otherTestName: '',
            otherScore: '',
        },
    });

    const testType = form.watch('testType');

    const calculateDisplayScore = (data: TestScoreFormData): string => {
        switch (data.testType) {
            case 'IELTS':
            case 'TOEFL': {
                const scores = [data.listening, data.reading, data.writing, data.speaking].filter(Boolean) as number[];
                if (scores.length === 4) {
                    const avg = data.testType === 'IELTS'
                        ? (scores.reduce((a, b) => a + b, 0) / 4).toFixed(1)
                        : String(Math.round(scores.reduce((a, b) => a + b, 0) / 4));
                    return `Overall: ${avg} (L:${data.listening} R:${data.reading} W:${data.writing} S:${data.speaking})`;
                }
                return 'Incomplete';
            }
            case 'SAT': {
                if (data.satReadingWriting && data.satMath) {
                    const total = data.satReadingWriting + data.satMath;
                    return `Total: ${total} (RW:${data.satReadingWriting} M:${data.satMath})`;
                }
                return 'Incomplete';
            }
            case 'ACT': {
                if (data.actComposite) {
                    return `Composite: ${data.actComposite}`;
                }
                return 'Incomplete';
            }
            case 'Duolingo English Test': {
                return data.duolingoScore ? `Score: ${data.duolingoScore}` : 'Incomplete';
            }
            case 'AP': {
                if (data.apSubject && data.apScore) {
                    return `${data.apSubject}: ${data.apScore}`;
                }
                return 'Incomplete';
            }
            case 'Other': {
                if (data.otherTestName && data.otherScore) {
                    return `${data.otherTestName}: ${data.otherScore}`;
                }
                return 'Incomplete';
            }
            default:
                return 'N/A';
        }
    };

    const onSubmit = (data: TestScoreFormData) => {
        if (editingId) {
            // Update existing
            setTestScores((prev) =>
                prev.map((t) =>
                    t.id === editingId
                        ? { ...data, id: editingId, displayScore: calculateDisplayScore(data) }
                        : t
                )
            );
        } else {
            // Create new
            const newScore: TestScore = {
                ...data,
                id: crypto.randomUUID(),
                displayScore: calculateDisplayScore(data),
            };
            setTestScores((prev) => [...prev, newScore]);
        }
        form.reset();
        setEditingId(null);
        setDialogOpen(false);
    };

    const openEditDialog = (test: TestScore) => {
        setEditingId(test.id);
        form.reset({
            testType: test.testType,
            month: test.month,
            year: test.year,
            listening: test.listening,
            reading: test.reading,
            writing: test.writing,
            speaking: test.speaking,
            satReadingWriting: test.satReadingWriting,
            satMath: test.satMath,
            actEnglish: test.actEnglish,
            actMath: test.actMath,
            actReading: test.actReading,
            actScience: test.actScience,
            actComposite: test.actComposite,
            duolingoScore: test.duolingoScore,
            apSubject: test.apSubject || '',
            apScore: test.apScore,
            otherTestName: test.otherTestName || '',
            otherScore: test.otherScore || '',
        });
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            form.reset();
            setEditingId(null);
        }
    };

    const deleteTest = (id: string) => {
        setTestScores((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Test Scores</h2>
                    <p className="text-sm text-muted-foreground">
                        Add your standardized test scores
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Test Score
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Test Score' : 'Add Test Score'}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Test Type */}
                                <FormField
                                    control={form.control}
                                    name="testType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test Type <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select test type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TEST_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Date Taken */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="month"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Month <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select month" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {MONTHS.map((month) => (
                                                            <SelectItem key={month} value={month}>
                                                                {month}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Year <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {YEARS.map((year) => (
                                                            <SelectItem key={year} value={year}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* IELTS / TOEFL Scores */}
                                {(testType === 'IELTS' || testType === 'TOEFL') && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium">
                                            {testType} Scores
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="listening"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Listening</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step={testType === 'IELTS' ? '0.5' : '1'}
                                                                placeholder={testType === 'IELTS' ? '0-9' : '0-30'}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="reading"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reading</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step={testType === 'IELTS' ? '0.5' : '1'}
                                                                placeholder={testType === 'IELTS' ? '0-9' : '0-30'}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="writing"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Writing</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step={testType === 'IELTS' ? '0.5' : '1'}
                                                                placeholder={testType === 'IELTS' ? '0-9' : '0-30'}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="speaking"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Speaking</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step={testType === 'IELTS' ? '0.5' : '1'}
                                                                placeholder={testType === 'IELTS' ? '0-9' : '0-30'}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* SAT Scores */}
                                {testType === 'SAT' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium">SAT Scores</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="satReadingWriting"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reading & Writing</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="200-800"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="satMath"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mathematics</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="200-800"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {form.watch('satReadingWriting') && form.watch('satMath') && (
                                            <p className="text-sm text-muted-foreground">
                                                Total Score: {Number(form.watch('satReadingWriting') || 0) + Number(form.watch('satMath') || 0)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ACT Scores */}
                                {testType === 'ACT' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium">ACT Scores</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="actEnglish"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>English</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="1-36" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actMath"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Math</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="1-36" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actReading"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reading</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="1-36" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actScience"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Science</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="1-36" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actComposite"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Composite</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="1-36" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Duolingo Score */}
                                {testType === 'Duolingo English Test' && (
                                    <FormField
                                        control={form.control}
                                        name="duolingoScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Overall Score</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="10-160" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* AP Scores */}
                                {testType === 'AP' && (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium">AP Exam</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="apSubject"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Subject</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select AP subject" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="max-h-60">
                                                                {AP_SUBJECTS.map((subject) => (
                                                                    <SelectItem key={subject} value={subject}>
                                                                        {subject}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="apScore"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Score (1-5)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={5}
                                                                placeholder="1-5"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Other Test */}
                                {testType === 'Other' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="otherTestName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Test Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter test name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="otherScore"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Score</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter score" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDialogChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#C26E26] hover:bg-[#A55A1F] text-white"
                                    >
                                        {editingId ? 'Save Changes' : 'Save Test Score'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State */}
            {
                testScores.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No test scores added yet
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first test score
                            </Button>
                        </CardContent>
                    </Card>
                )
            }

            {/* Test Scores List */}
            {
                testScores.length > 0 && (
                    <div className="space-y-3">
                        {testScores.map((test) => (
                            <Card
                                key={test.id}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => openEditDialog(test)}
                            >
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{test.testType}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {test.month} {test.year}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {test.displayScore}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTest(test.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
