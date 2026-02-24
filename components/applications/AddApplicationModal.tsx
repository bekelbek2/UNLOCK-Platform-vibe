'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { universities, type University } from '@/data/universities';
import { useProgramStore, type Program } from '@/lib/programStore';
import { useApplicationStore } from '@/lib/applicationStore';
import { toast } from 'sonner';
import { ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';

const termOptions = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'];

const admissionPlanOptions = [
    'Regular Decision',
    'Early Action',
    'Early Decision I',
    'Early Decision II',
    'Rolling Admission',
];

type SelectedEntity =
    | { type: 'university'; data: University }
    | { type: 'program'; data: Program };

interface AddApplicationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddApplicationModal({ open, onOpenChange }: AddApplicationModalProps) {
    const { addApplication } = useApplicationStore();
    const { programs } = useProgramStore();

    const [selected, setSelected] = useState<SelectedEntity | null>(null);
    const [term, setTerm] = useState('Fall 2026');
    const [admissionPlan, setAdmissionPlan] = useState('Regular Decision');

    const handleSelect = (entity: SelectedEntity) => setSelected(entity);
    const handleBack = () => setSelected(null);

    const handleSubmit = () => {
        if (!selected) return;

        const entity = selected.data;
        addApplication({
            universityId: entity.id,
            universityName: entity.name,
            entityType: selected.type === 'university' ? 'university' : 'program',
            deadline: entity.deadline,
            term,
            admissionPlan,
        });

        toast.success(`${entity.name} added to your applications!`);

        setSelected(null);
        setTerm('Fall 2026');
        setAdmissionPlan('Regular Decision');
        onOpenChange(false);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            setSelected(null);
            setTerm('Fall 2026');
            setAdmissionPlan('Regular Decision');
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
                {!selected ? (
                    /* ─── Phase 1: Search ─── */
                    <>
                        <DialogHeader className="px-6 pt-6 pb-0">
                            <DialogTitle className="text-xl">Add Application</DialogTitle>
                            <DialogDescription className="text-gray-500">
                                Search for a university or program to add.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="universities" className="w-full">
                            <div className="px-6 pt-3">
                                <TabsList className="h-9 p-0.5 bg-gray-100 rounded-lg w-full">
                                    <TabsTrigger
                                        value="universities"
                                        className="rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 gap-1.5"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        Universities
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="programs"
                                        className="rounded-md text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1 gap-1.5"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Programs
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Universities Tab */}
                            <TabsContent value="universities" className="mt-0">
                                <Command className="border-none shadow-none">
                                    <div className="px-4">
                                        <CommandInput placeholder="Search universities…" className="h-11" />
                                    </div>
                                    <CommandList className="max-h-[300px] px-2 pb-4">
                                        <CommandEmpty>
                                            <div className="flex flex-col items-center py-8 text-gray-400">
                                                <GraduationCap className="w-10 h-10 mb-2" />
                                                <p>No universities found.</p>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {universities.map((uni) => (
                                                <CommandItem
                                                    key={uni.id}
                                                    value={`${uni.name} ${uni.country}`}
                                                    onSelect={() =>
                                                        handleSelect({ type: 'university', data: uni })
                                                    }
                                                    className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                                                        <img
                                                            src={uni.logoUrl}
                                                            alt={uni.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {uni.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{uni.country}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                                        #{uni.rank}
                                                    </span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </TabsContent>

                            {/* Programs Tab */}
                            <TabsContent value="programs" className="mt-0">
                                <Command className="border-none shadow-none">
                                    <div className="px-4">
                                        <CommandInput placeholder="Search programs…" className="h-11" />
                                    </div>
                                    <CommandList className="max-h-[300px] px-2 pb-4">
                                        <CommandEmpty>
                                            <div className="flex flex-col items-center py-8 text-gray-400">
                                                <BookOpen className="w-10 h-10 mb-2" />
                                                <p>No programs found.</p>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {programs.map((prog) => (
                                                <CommandItem
                                                    key={prog.id}
                                                    value={`${prog.name} ${prog.country}`}
                                                    onSelect={() =>
                                                        handleSelect({ type: 'program', data: prog })
                                                    }
                                                    className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                                                        <img
                                                            src={prog.logoUrl}
                                                            alt={prog.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {prog.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{prog.country}</p>
                                                    </div>
                                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] flex-shrink-0">
                                                        Program
                                                    </Badge>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    /* ─── Phase 2: Configure ─── */
                    <>
                        <DialogHeader className="px-6 pt-6 pb-0">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-gray-700"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <DialogTitle className="text-xl">Configure Application</DialogTitle>
                            </div>
                            <DialogDescription className="text-gray-500 ml-10">
                                Set your term and admission plan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-6 py-6 space-y-6">
                            {/* Selected Entity */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-12 h-12 rounded-md border border-gray-200 bg-white flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                                    <img
                                        src={selected.data.logoUrl}
                                        alt={selected.data.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900 text-lg truncate">
                                            {selected.data.name}
                                        </p>
                                        <Badge
                                            className={`text-[10px] flex-shrink-0 ${selected.type === 'program'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}
                                        >
                                            {selected.type === 'program' ? 'Program' : 'University'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">{selected.data.country}</p>
                                </div>
                            </div>

                            {/* Term */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Term</Label>
                                <Select value={term} onValueChange={setTerm}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {termOptions.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Admission Plan */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Admission Plan
                                </Label>
                                <Select value={admissionPlan} onValueChange={setAdmissionPlan}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select admission plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {admissionPlanOptions.map((p) => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="px-6 pb-6 gap-3">
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-[#e75e24] hover:bg-[#c24e1b] text-white"
                                onClick={handleSubmit}
                            >
                                Add to Applications
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
