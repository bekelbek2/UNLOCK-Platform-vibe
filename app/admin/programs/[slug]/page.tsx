'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProgramStore, type Lesson } from '@/lib/programStore';
import { useSystemStore } from '@/lib/systemStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ChevronLeft, Plus, Trash2, Pencil, Clock, DollarSign, BookOpen,
    Save, Loader2, Zap, Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const {
        programs, lessons,
        addLesson, updateLesson, deleteLesson,
        updateProgram,
        getTotalHours, getTotalPrice,
    } = useProgramStore();

    const { users } = useSystemStore();
    const mentors = users.filter(u => u.role === 'admin');

    const program = programs.find((p) => p.slug === slug);
    const programLessons = useMemo(
        () => lessons.filter((l) => l.programId === program?.id),
        [lessons, program?.id]
    );

    // Group by category
    const categories = useMemo(() => {
        const catMap = new Map<string, Lesson[]>();
        for (const l of programLessons) {
            const arr = catMap.get(l.category) || [];
            arr.push(l);
            catMap.set(l.category, arr);
        }
        return Array.from(catMap.entries());
    }, [programLessons]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ─── Inline editing state ────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editHours, setEditHours] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editDivision, setEditDivision] = useState('');

    const startEdit = (lesson: Lesson) => {
        setEditingId(lesson.id);
        setEditName(lesson.name);
        setEditHours(String(lesson.hours));
        setEditPrice(String(lesson.price));
        setEditDivision(lesson.division);
    };

    const saveEdit = () => {
        if (!editingId) return;
        updateLesson(editingId, {
            name: editName.trim() || 'Untitled',
            hours: Math.max(0, parseFloat(editHours) || 0),
            price: Math.max(0, parseFloat(editPrice) || 0),
            division: editDivision.trim(),
        });
        setEditingId(null);
        toast.success('Lesson updated');
    };

    const cancelEdit = () => setEditingId(null);

    // ─── Add lesson modal ────────────────────────────────────────────────────
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [newDivision, setNewDivision] = useState('');
    const [newHours, setNewHours] = useState('1');
    const [newPrice, setNewPrice] = useState('0');
    const [newIsFlexible, setNewIsFlexible] = useState(false);

    const resetAddForm = () => {
        setNewName('');
        setNewCategory('');
        setIsNewCategory(false);
        setCustomCategory('');
        setNewDivision('');
        setNewHours('1');
        setNewPrice('0');
        setNewIsFlexible(false);
    };

    const handleAdd = () => {
        if (!program || !newName.trim()) return;

        let finalCategory = newCategory;
        if (isNewCategory) {
            finalCategory = customCategory.trim();
        }

        addLesson({
            programId: program.id,
            category: finalCategory || 'Other',
            division: newDivision.trim() || 'General',
            name: newName.trim(),
            hours: Math.max(0, parseFloat(newHours) || 0),
            price: Math.max(0, parseFloat(newPrice) || 0),
            isFlexible: newIsFlexible,
        });
        toast.success('Lesson added');
        resetAddForm();
        setAddOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        deleteLesson(id);
        toast.success(`Deleted "${name}"`);
    };

    const [addRoleOpen, setAddRoleOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const handleAddRole = () => {
        if (!program || !newRoleName.trim()) return;

        // Ensure no duplicate role names
        const roleExists = program.mentorRoles?.some(r =>
            r.role.toLowerCase() === newRoleName.trim().toLowerCase()
        );
        if (roleExists) {
            toast.error('Role already exists');
            return;
        }

        const newRoles = [...(program.mentorRoles || []), { role: newRoleName.trim(), mentorId: '' }];
        updateProgram(program.id, { mentorRoles: newRoles });
        setNewRoleName('');
        setAddRoleOpen(false);
        toast.success('Mentor role added');
    };

    const handleDeleteRole = (index: number) => {
        if (!program || !program.mentorRoles) return;
        const newRoles = [...program.mentorRoles];
        newRoles.splice(index, 1);
        updateProgram(program.id, { mentorRoles: newRoles });
        toast.success('Mentor role removed');
    };

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Program not found.</p>
                    <Button variant="outline" onClick={() => router.push('/admin/programs')}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Programs
                    </Button>
                </div>
            </div>
        );
    }

    const totalHours = mounted ? getTotalHours(program.id) : 0;
    const totalPrice = mounted ? getTotalPrice(program.id) : 0;

    // Detect unique categories for the add form
    const existingCategories = [...new Set(programLessons.map((l) => l.category))];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-16">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
                <button
                    onClick={() => router.push('/admin/programs')}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-[#C26E26] transition-colors mb-3"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Back to Programs
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">{program.description}</p>
                    </div>
                    <Button
                        onClick={() => { resetAddForm(); setAddOpen(true); }}
                        className="bg-[#C26E26] hover:bg-[#a65d1f] text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lesson
                    </Button>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="border-gray-200 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{mounted ? programLessons.length : '—'}</p>
                                <p className="text-xs text-gray-500 font-medium">Total Lessons</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{mounted ? totalHours.toFixed(1) : '—'}</p>
                                <p className="text-xs text-gray-500 font-medium">Total Hours</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">${mounted ? totalPrice.toLocaleString() : '—'}</p>
                                <p className="text-xs text-gray-500 font-medium">Total Price</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mentor Roles Section */}
                {mounted && program.mentorRoles !== undefined && (
                    <Card className="border-gray-200 shadow-sm overflow-hidden mb-8">
                        <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#C26E26]" />
                                    Required Mentor Roles
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">These roles will be added to any study plan using this program, where specific mentors can then be assigned.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setAddRoleOpen(true)} className="text-[#C26E26] border-orange-200 hover:bg-orange-50 shrink-0">
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Role
                            </Button>
                        </div>
                        <div className="p-6">
                            {program.mentorRoles.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-900">No mentor roles defined.</p>
                                    <p className="text-xs mt-1">Add roles if this program requires specific mentors (e.g. Writing Mentor, Tech Mentor).</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {program.mentorRoles.map((mr, idx) => (
                                        <div key={mr.role} className="relative group p-4 rounded-xl border border-gray-200 bg-white hover:border-[#C26E26]/50 hover:shadow-sm transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                    <Shield className="w-4 h-4 text-[#C26E26]" />
                                                </div>
                                                <span className="font-semibold text-gray-900 text-sm truncate">{mr.role}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRole(idx)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity ml-2 shrink-0 p-1"
                                                title="Remove Role"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Lessons Table by Category */}
                {!mounted ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#C26E26] animate-spin" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <BookOpen className="w-12 h-12 mb-3" />
                        <p className="font-medium text-gray-900 text-lg mb-1">No lessons yet</p>
                        <p className="text-sm text-gray-500">Add lessons to build this program&apos;s curriculum.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {categories.map(([category, catLessons]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{category}</h3>
                                    <Badge variant="secondary" className="text-xs">{catLessons.length}</Badge>
                                </div>
                                <Card className="border-gray-200 shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/80">
                                                <TableHead className="w-[40px]">#</TableHead>
                                                <TableHead>Lesson Name</TableHead>
                                                <TableHead className="w-[140px]">Division</TableHead>
                                                <TableHead className="w-[90px] text-center">Hours</TableHead>
                                                <TableHead className="w-[100px] text-center">Price ($)</TableHead>
                                                <TableHead className="w-[80px] text-center">Type</TableHead>
                                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {catLessons.map((lesson, idx) => {
                                                const isEditing = editingId === lesson.id;

                                                if (isEditing) {
                                                    return (
                                                        <TableRow key={lesson.id} className="bg-amber-50/30">
                                                            <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    className="h-8 text-sm"
                                                                    autoFocus
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editDivision}
                                                                    onChange={(e) => setEditDivision(e.target.value)}
                                                                    className="h-8 text-sm"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.25"
                                                                    min="0"
                                                                    value={editHours}
                                                                    onChange={(e) => setEditHours(e.target.value)}
                                                                    className="h-8 text-sm text-center"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="1"
                                                                    min="0"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                                    className="h-8 text-sm text-center"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {lesson.isFlexible ? (
                                                                    <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Flex</Badge>
                                                                ) : (
                                                                    <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px]">Fixed</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={saveEdit}>
                                                                        <Save className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600" onClick={cancelEdit}>
                                                                        <ChevronLeft className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                return (
                                                    <TableRow key={lesson.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <TableCell className="text-gray-400 text-sm font-mono">{idx + 1}</TableCell>
                                                        <TableCell className="font-medium text-gray-900">{lesson.name}</TableCell>
                                                        <TableCell>
                                                            <span className="text-sm text-gray-500">{lesson.division}</span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="text-sm font-semibold text-gray-700">{lesson.hours}h</span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="text-sm font-semibold text-gray-700">${lesson.price}</span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {lesson.isFlexible ? (
                                                                <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">
                                                                    <Zap className="w-2.5 h-2.5 mr-0.5" />Flex
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px]">Fixed</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-[#C26E26] hover:bg-orange-50" onClick={() => startEdit(lesson)}>
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(lesson.id, lesson.name)}>
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Lesson Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>Add a new lesson to {program.name}.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
                        className="space-y-4 mt-2"
                    >
                        <div className="space-y-2">
                            <Label>Lesson Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Personal Statement Review"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                {!isNewCategory ? (
                                    <Select
                                        value={newCategory}
                                        onValueChange={(val) => {
                                            if (val === 'create-new') {
                                                setIsNewCategory(true);
                                                setNewCategory('');
                                            } else {
                                                setNewCategory(val);
                                            }
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            {existingCategories.filter(c => c !== 'Other').map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                            <SelectItem value="Other">Other</SelectItem>
                                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                            <SelectItem value="create-new" className="text-[#C26E26] font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Create New Category...
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            placeholder="e.g. Test Prep"
                                            autoFocus
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setIsNewCategory(false); setCustomCategory(''); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                                            title="Cancel new category"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Division</Label>
                                <Input
                                    value={newDivision}
                                    onChange={(e) => setNewDivision(e.target.value)}
                                    placeholder="e.g. Personal Statement"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hours</Label>
                                <Input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    value={newHours}
                                    onChange={(e) => setNewHours(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price ($)</Label>
                                <Input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is-flexible"
                                checked={newIsFlexible}
                                onCheckedChange={(v) => setNewIsFlexible(v === true)}
                            />
                            <Label htmlFor="is-flexible" className="text-sm text-gray-600 cursor-pointer">
                                Flexible (only added per-student during study plan creation)
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-[#C26E26] hover:bg-[#a65d1f] text-white" disabled={!newName.trim()}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Lesson
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Role Dialog */}
            <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Mentor Role</DialogTitle>
                        <DialogDescription>Define a new mentor role category for this program (e.g., Essay Mentor, Tech Mentor).</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleAddRole(); }}
                        className="space-y-4 mt-2"
                    >
                        <div className="space-y-2">
                            <Label>Role Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="e.g. Activity Mentor"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setAddRoleOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-[#C26E26] hover:bg-[#a65d1f] text-white" disabled={!newRoleName.trim()}>
                                Add Role
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
