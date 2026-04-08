'use client';

import { useState, useMemo } from 'react';
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
import { useApplicationStore } from '@/lib/applicationStore';
import { useUniversityStore, type University, type DeadlineRound } from '@/lib/universityStore';
import { toast } from 'sonner';
import { ArrowLeft, GraduationCap, BookOpen, CalendarClock, Clock, AlertCircle } from 'lucide-react';

const termOptions = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'];

interface SelectedEntity {
    type: 'university' | 'program';
    data: University;
}

interface AddApplicationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AddApplicationModal({ open, onOpenChange }: AddApplicationModalProps) {
    const { addApplication } = useApplicationStore();

    const [selected, setSelected] = useState<SelectedEntity | null>(null);
    const [term, setTerm] = useState('Fall 2026');
    const [selectedRoundId, setSelectedRoundId] = useState<string>('');

    const { universities: catalog } = useUniversityStore();

    const universities = catalog.filter((row: University) => row.type === 'university');
    const programs = catalog.filter((row: University) => row.type === 'program');

    const availableRounds = useMemo(() => {
        return selected?.data.deadlines ?? [];
    }, [selected]);

    const selectedRound = useMemo(() => {
        return availableRounds.find(r => r.id === selectedRoundId) ?? null;
    }, [availableRounds, selectedRoundId]);

    const handleSelect = (entity: SelectedEntity) => {
        setSelected(entity);
        setSelectedRoundId('');
    };
    const handleBack = () => {
        setSelected(null);
        setSelectedRoundId('');
    };

    const handleSubmit = async () => {
        if (!selected) return;

        const entity = selected.data;
        await addApplication({
            universityId: entity.id,
            universityName: entity.name,
            entityType: selected.type,
            deadline: selectedRound?.date ?? '',
            unlockDeadline: selectedRound?.unlockDate ?? '',
            deadlineRoundId: selectedRound?.id ?? '',
            deadlineRoundName: selectedRound?.name ?? '',
            admissionPlan: selectedRound?.name ?? '',
            term,
        }, entity);

        toast.success(`${entity.name} added to your applications!`);

        setSelected(null);
        setSelectedRoundId('');
        setTerm('Fall 2026');
        onOpenChange(false);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            setSelected(null);
            setSelectedRoundId('');
            setTerm('Fall 2026');
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
                                                        {uni.logo_url ? (
                                                            <img
                                                                src={uni.logo_url}
                                                                alt={uni.name}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <GraduationCap className="w-5 h-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {uni.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{uni.country}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {(uni.deadlines?.length ?? 0) > 0 && (
                                                            <Badge variant="secondary" className="text-[9px] gap-0.5">
                                                                <CalendarClock className="w-2.5 h-2.5" />
                                                                {uni.deadlines!.length}
                                                            </Badge>
                                                        )}
                                                        {uni.rank && (
                                                            <span className="text-xs text-gray-400">#{uni.rank}</span>
                                                        )}
                                                    </div>
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
                                                        {prog.logo_url ? (
                                                            <img
                                                                src={prog.logo_url}
                                                                alt={prog.name}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <BookOpen className="w-5 h-5 text-gray-300" />
                                                        )}
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
                                Set your term and deadline round.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-6 py-6 space-y-6">
                            {/* Selected Entity */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-12 h-12 rounded-md border border-gray-200 bg-white flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                                    {selected.data.logo_url ? (
                                        <img
                                            src={selected.data.logo_url}
                                            alt={selected.data.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <GraduationCap className="w-6 h-6 text-gray-300" />
                                    )}
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

                            {/* Deadline Round Picker */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Deadline Round
                                </Label>
                                {availableRounds.length > 0 ? (
                                    <div className="space-y-2">
                                        {availableRounds.map((round) => {
                                            const isSelected = selectedRoundId === round.id;
                                            return (
                                                <button
                                                    key={round.id}
                                                    type="button"
                                                    onClick={() => setSelectedRoundId(round.id)}
                                                    className={`w-full text-left p-3.5 rounded-lg border-2 transition-all duration-150 ${isSelected
                                                        ? 'border-[#e75e24] bg-orange-50/50 shadow-sm'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-sm font-semibold ${isSelected ? 'text-[#e75e24]' : 'text-gray-900'}`}>
                                                            {round.name}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="w-2 h-2 rounded-full bg-[#e75e24]" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs">
                                                        <span className="flex items-center gap-1 text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(round.date)}
                                                        </span>
                                                        {round.unlockDate && (
                                                            <span className="flex items-center gap-1 text-[#e75e24]">
                                                                <CalendarClock className="w-3 h-3" />
                                                                UNLOCK: {formatDate(round.unlockDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-amber-800 font-medium">No deadline rounds configured</p>
                                            <p className="text-xs text-amber-600 mt-0.5">
                                                Ask your admin to add deadline rounds to this {selected.type === 'program' ? 'program' : 'university'} in the catalog.
                                            </p>
                                        </div>
                                    </div>
                                )}
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
