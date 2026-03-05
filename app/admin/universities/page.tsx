'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUniversityStore } from '@/lib/universityStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Pencil,
    Trash2,
    GraduationCap,
    BookOpen,
    Loader2,
    Search,
    Globe,
    AlertTriangle,
    Upload,
    X,
    ImageIcon,
} from 'lucide-react';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

import { University } from '@/lib/universityStore';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const formSchema = z.object({
    type: z.enum(['university', 'program']),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    country: z.string().min(2, 'Country is required'),
    website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    rank: z.coerce.number().int().positive().optional().or(z.literal(0)),
    acceptance_rate: z.coerce.number().min(0).max(100).optional().or(z.literal(0)),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUniversitiesPage() {
    const { universities: catalog, addUniversity, updateUniversity, deleteUniversity } = useUniversityStore();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'university' | 'program'>('university');

    // To prevent hydration errors, we only render the table once mounted
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    // Modal state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<University | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Logo file upload state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoError, setLogoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            type: 'university',
            name: '',
            country: '',
            website_url: '',
            rank: 0,
            acceptance_rate: 0,
        },
    });

    const watchedType = form.watch('type');

    // ─── Filtered data ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let items = catalog.filter((r) => r.type === activeTab);
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.country.toLowerCase().includes(q)
            );
        }
        return items;
    }, [catalog, activeTab, search]);

    // ─── Open modal for Add ──────────────────────────────────────────────────
    const handleAdd = () => {
        setEditingRow(null);
        setLogoFile(null);
        setLogoPreview(null);
        setLogoError(null);
        form.reset({
            type: activeTab,
            name: '',
            country: '',
            website_url: '',
            rank: 0,
            acceptance_rate: 0,
        });
        setDialogOpen(true);
    };

    // ─── Open modal for Edit ─────────────────────────────────────────────────
    const handleEdit = (row: University) => {
        setEditingRow(row);
        setLogoFile(null);
        setLogoPreview(row.logo_url ?? null);
        setLogoError(null);
        form.reset({
            type: row.type,
            name: row.name,
            country: row.country,
            website_url: row.website_url ?? '',
            rank: row.rank ?? 0,
            acceptance_rate: row.acceptance_rate ?? 0,
        });
        setDialogOpen(true);
    };

    // ─── Logo file handler ───────────────────────────────────────────────────
    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setLogoError(null);
        if (!file) {
            setLogoFile(null);
            setLogoPreview(editingRow?.logo_url ?? null);
            return;
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setLogoError('Only JPEG, PNG, WebP, and SVG images are accepted.');
            setLogoFile(null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setLogoError('File must be smaller than 1MB.');
            setLogoFile(null);
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const clearLogoFile = () => {
        setLogoFile(null);
        setLogoPreview(editingRow?.logo_url ?? null);
        setLogoError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Submit (Create or Update) ───────────────────────────────────────────
    const onSubmit = (values: FormValues) => {
        setSaving(true);

        try {
            if (editingRow) {
                updateUniversity(editingRow.id, {
                    ...values,
                    rank: values.type === 'university' ? (values.rank || null) : null,
                    acceptance_rate: values.type === 'university' ? (values.acceptance_rate || null) : null,
                });
                toast.success(`${values.name} updated successfully!`);
            } else {
                addUniversity({
                    ...values,
                    logo_url: null,
                    website_url: values.website_url || null,
                    rank: values.type === 'university' ? (values.rank || null) : null,
                    acceptance_rate: values.type === 'university' ? (values.acceptance_rate || null) : null,
                    tags: [],
                });
                toast.success(`${values.name} added to catalog!`);
            }
        } catch (error: any) {
            toast.error(`Operation failed: ${error.message}`);
        }

        setSaving(false);
        setDialogOpen(false);
        setEditingRow(null);
        form.reset();
    };

    // ─── Delete ──────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const targetId = deleteTarget.id;
        const targetName = deleteTarget.name;

        try {
            deleteUniversity(targetId);
            toast.success(`${targetName} removed from catalog.`);
        } catch (dbError: any) {
            toast.error(`Delete failed: ${dbError.message}`);
        }

        setDeleting(false);
        setDeleteTarget(null);
    };

    // ─── Table Row Component ─────────────────────────────────────────────────
    const DataRow = ({ row }: { row: University }) => (
        <TableRow className="hover:bg-orange-50/30 transition-colors">
            <TableCell>
                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    {row.logo_url ? (
                        <img
                            src={row.logo_url}
                            alt={row.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        row.type === 'university' ? (
                            <GraduationCap className="w-5 h-5 text-gray-300" />
                        ) : (
                            <BookOpen className="w-5 h-5 text-purple-300" />
                        )
                    )}
                </div>
            </TableCell>
            <TableCell className="font-semibold text-gray-900">{row.name}</TableCell>
            <TableCell className="text-gray-600">{row.country}</TableCell>
            <TableCell>
                {row.rank ? (
                    <span className="text-sm font-medium text-gray-700">#{row.rank}</span>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </TableCell>
            <TableCell>
                {row.acceptance_rate ? (
                    <span className="text-sm text-gray-600">{row.acceptance_rate}%</span>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-[#e75e24] hover:bg-orange-50"
                        onClick={() => handleEdit(row)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(row)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );

    // ─── Seed Data (temporary) ────────────────────────────────────────────────
    const [seeding, setSeeding] = useState(false);

    const handleSeedData = async () => {
        setSeeding(true);

        const seedRows = [
            {
                name: 'National University of Singapore (NUS)',
                country: 'Singapore',
                type: 'university',
                logo_url: 'https://logo.clearbit.com/nus.edu.sg',
                website_url: 'https://nus.edu.sg',
                rank: 8,
                acceptance_rate: 5,
            },
            {
                name: 'University of Tokyo',
                country: 'Japan',
                type: 'university',
                logo_url: 'https://logo.clearbit.com/u-tokyo.ac.jp',
                website_url: 'https://www.u-tokyo.ac.jp',
                rank: 28,
                acceptance_rate: 10,
            },
            {
                name: 'Riga Technical University',
                country: 'Latvia',
                type: 'university',
                logo_url: 'https://logo.clearbit.com/rtu.lv',
                website_url: 'https://www.rtu.lv',
                rank: 700,
                acceptance_rate: 60,
            },
            {
                name: 'Yale Young Global Scholars (YYGS)',
                country: 'USA',
                type: 'program',
                logo_url: 'https://logo.clearbit.com/yale.edu',
                website_url: 'https://globalscholars.yale.edu/',
                rank: null,
                acceptance_rate: null,
            },
            {
                name: 'Oxford Summer Courses',
                country: 'UK',
                type: 'program',
                logo_url: 'https://logo.clearbit.com/oxfordsummercourses.com',
                website_url: 'https://oxfordsummercourses.com',
                rank: null,
                acceptance_rate: null,
            },
        ];

        try {
            seedRows.forEach(row => {
                addUniversity({
                    ...row,
                    type: row.type as 'university' | 'program',
                    tags: []
                });
            });
            toast.success('Test data inserted! 🎉');
        } catch (error: any) {
            toast.error(`Seed failed: ${error.message}`);
        }

        setSeeding(false);
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">University & Program Catalog</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage the master catalog of universities and summer programs.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 text-gray-600 border-gray-300"
                        onClick={handleSeedData}
                        disabled={seeding}
                    >
                        {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : '🌱'}
                        Seed Data
                    </Button>
                    <Button
                        className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2 shadow-sm"
                        onClick={handleAdd}
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </Button>
                </div>
            </div>

            {/* Tabs + Search */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'university' | 'program')}>
                        <TabsList className="h-9 p-0.5 bg-gray-100 rounded-lg">
                            <TabsTrigger
                                value="university"
                                className="rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 px-4"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                Universities
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-gray-200/60">
                                    {catalog.filter((r) => r.type === 'university').length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="program"
                                className="rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 px-4"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Programs
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-gray-200/60">
                                    {catalog.filter((r) => r.type === 'program').length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                {!isMounted ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#e75e24] animate-spin" />
                    </div>
                ) : filtered.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/80">
                                <TableHead className="w-[60px]">Logo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead className="w-[100px]">Acceptance</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((row) => (
                                <DataRow key={row.id} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        {activeTab === 'university' ? (
                            <GraduationCap className="w-12 h-12 mb-3" />
                        ) : (
                            <BookOpen className="w-12 h-12 mb-3" />
                        )}
                        <p className="font-medium text-gray-900 text-lg mb-1">No entries yet</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Click &quot;Add New&quot; to create your first {activeTab === 'university' ? 'university' : 'program'}.
                        </p>
                        <Button
                            className="bg-[#e75e24] hover:bg-[#c24e1b] text-white gap-2"
                            onClick={handleAdd}
                        >
                            <Plus className="w-4 h-4" />
                            Add {activeTab === 'university' ? 'University' : 'Program'}
                        </Button>
                    </div>
                )}
            </div>

            {/* ═══ Add / Edit Dialog ═══ */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingRow ? 'Edit Entry' : 'Add New Entry'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            {editingRow
                                ? `Editing ${editingRow.name}.`
                                : 'Fill in the details to add a new university or program.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
                            {/* Type */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="university">
                                                    <span className="flex items-center gap-2">
                                                        <GraduationCap className="w-4 h-4" /> University
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="program">
                                                    <span className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" /> Program
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Name + Country */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Harvard University" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. United States" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Logo Upload + Website URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Logo</label>
                                    <div className="space-y-2">
                                        {/* Preview */}
                                        {logoPreview && (
                                            <div className="relative w-16 h-16 rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-contain p-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearLogoFile}
                                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        {/* File Input */}
                                        <div
                                            className="relative flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#e75e24] hover:bg-orange-50/30 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-500 truncate">
                                                {logoFile ? logoFile.name : 'Upload image (max 1MB)'}
                                            </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                className="hidden"
                                                onChange={handleLogoFileChange}
                                            />
                                        </div>
                                        {logoError && (
                                            <p className="text-xs text-red-500 font-medium">{logoError}</p>
                                        )}
                                    </div>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="website_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Conditional: University fields */}
                            {watchedType === 'university' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="rank"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>World Rank</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g. 1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="acceptance_rate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Acceptance Rate (%)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g. 3.2"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}



                            <DialogFooter className="pt-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#e75e24] hover:bg-[#c24e1b] text-white min-w-[120px]"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : editingRow ? (
                                        'Save Changes'
                                    ) : (
                                        'Add to Catalog'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ═══ Delete Confirmation Dialog ═══ */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-lg">Delete {deleteTarget?.name}?</DialogTitle>
                        <DialogDescription className="text-center text-gray-500">
                            This will permanently remove this entry from the catalog. Any applications referencing it will lose the connection.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
