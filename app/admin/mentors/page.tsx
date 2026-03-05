'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSystemStore } from '@/lib/systemStore';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Users, Plus, Shield, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { User } from '@/lib/authStore';

export default function AdminMentorsPage() {
    const { users, addUser, updateUser, deleteUser } = useSystemStore();
    const mentors = useMemo(() => users.filter(u => u.role === 'admin'), [users]);
    const [search, setSearch] = useState('');

    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    // Form inputs
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // To prevent hydration errors, we only render the table once mounted
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const filtered = useMemo(() => {
        if (!search.trim()) return mentors;
        const q = search.toLowerCase();
        return mentors.filter((m) =>
            (m.full_name?.toLowerCase().includes(q) ?? false) ||
            (m.email?.toLowerCase().includes(q) ?? false)
        );
    }, [mentors, search]);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setApiError('');
        setSelectedMentor(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsAddOpen(true);
    };

    const handleOpenEdit = (mentor: User) => {
        resetForm();
        setSelectedMentor(mentor);
        setFullName(mentor.full_name || '');
        setEmail(mentor.email || '');
        setIsEditOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        setIsSubmitting(true);

        try {
            addUser({
                email,
                full_name: fullName,
                role: 'admin',
                avatar_url: null,
            });
            setIsAddOpen(false);
            resetForm();
        } catch (error: any) {
            setApiError(error.message || 'Failed to create admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentor) return;

        setApiError('');
        setIsSubmitting(true);

        try {
            updateUser(selectedMentor.id, {
                email,
                full_name: fullName,
            });
            setIsEditOpen(false);
            resetForm();
        } catch (error: any) {
            setApiError(error.message || 'Failed to update admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${name}? This cannot be undone.`)) return;

        try {
            deleteUser(id);
        } catch (error: any) {
            alert(`Failed to delete: ${error.message}`);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-[#e75e24]" />
                        Mentors & Admins
                    </h1>
                    <p className="text-gray-500 mt-1">Manage internal team members and platform administrators</p>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="bg-[#e75e24] hover:bg-[#c24e1c] text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                </Button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white focus:border-[#e75e24] focus:ring-[#e75e24]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-100">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">Full Name</TableHead>
                            <TableHead className="font-semibold text-gray-600">Email Address</TableHead>
                            <TableHead className="font-semibold text-gray-600">Role</TableHead>
                            <TableHead className="font-semibold text-gray-600">Added On</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isMounted ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#e75e24]" />
                                        <span>Loading team members...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Users className="w-8 h-8 text-gray-300" />
                                        <p>No admins matching your search</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((mentor) => (
                                <TableRow key={mentor.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#e75e24] font-bold text-xs uppercase">
                                                {mentor.full_name?.charAt(0) || 'A'}
                                            </div>
                                            {mentor.full_name || 'Unnamed Admin'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {mentor.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-orange-50 text-[#e75e24] border-orange-200 font-semibold uppercase text-[10px] tracking-wider">
                                            Administrator
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        Just now
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(mentor)}
                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(mentor.id, mentor.full_name || 'this admin')}
                                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Admin Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#e75e24]" />
                            Create New Admin
                        </DialogTitle>
                        <DialogDescription>
                            This user will have full access to the UNLOCK dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    {apiError && (
                        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{apiError}</span>
                        </div>
                    )}

                    <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Sarah Connor"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Temporary Password <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-[#e75e24] hover:bg-[#c24e1c]">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5 text-indigo-600" />
                            Edit Admin Profile
                        </DialogTitle>
                    </DialogHeader>

                    {apiError && (
                        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{apiError}</span>
                        </div>
                    )}

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password (Optional)</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep unchanged"
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">Only fill this if you want to reset their password.</p>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
