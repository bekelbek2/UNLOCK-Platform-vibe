'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, GraduationCap, CalendarClock, BookOpen, Clock, DollarSign } from 'lucide-react';
import { universities, type University, type ScholarshipType } from '@/data/universities';
import { useProgramStore, type Program } from '@/lib/programStore';

// ─── Scholarship Badge Helper ─────────────────────────────────────────────────
const scholarshipConfig: Record<ScholarshipType, { label: string; className: string }> = {
    'full-ride': { label: 'Full-Ride', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'full-tuition': { label: 'Full-Tuition', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    none: { label: 'No Scholarship', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

// ─── University Card ──────────────────────────────────────────────────────────
function UniversityCard({ university }: { university: University }) {
    const scholarship = scholarshipConfig[university.scholarshipType];

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200">
            <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1">
                    <img
                        src={university.logoUrl}
                        alt={`${university.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            </div>

            <div className="px-6 mt-4">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#C26E26] transition-colors">
                    {university.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{university.country}</p>
            </div>

            <div className="px-6 mt-3">
                <Badge className={`${scholarship.className} text-xs font-medium px-2.5 py-0.5`}>
                    {scholarship.label}
                </Badge>
            </div>

            <div className="px-6 pb-6 mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Rank</span>
                    <span className="font-semibold text-gray-900">#{university.rank}</span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Tuition</span>
                    <span className="font-semibold text-gray-900">{university.tuition}</span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Acceptance</span>
                    <span className="font-semibold text-gray-900">{university.acceptanceRate}</span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" /> Deadline
                    </span>
                    <span className="font-semibold text-gray-900">{university.deadline}</span>
                </div>
            </div>
        </Card>
    );
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ program }: { program: Program }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200">
            <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1">
                    <img
                        src={program.logoUrl}
                        alt={`${program.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center bg-purple-50 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>';
                        }}
                    />
                </div>
            </div>

            <div className="px-6 mt-4">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {program.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{program.country}</p>
            </div>

            <div className="px-6 mt-3">
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium px-2.5 py-0.5">
                    Program
                </Badge>
            </div>

            <div className="px-6 pb-6 mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Duration
                    </span>
                    <span className="font-semibold text-gray-900">{program.duration}</span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Cost
                    </span>
                    <span className="font-semibold text-gray-900">{program.cost}</span>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" /> Deadline
                    </span>
                    <span className="font-semibold text-gray-900">{program.deadline}</span>
                </div>
            </div>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
    const { programs } = useProgramStore();
    const [uniSearch, setUniSearch] = useState('');
    const [progSearch, setProgSearch] = useState('');

    const filteredUniversities = useMemo(() => {
        if (!uniSearch.trim()) return universities;
        const q = uniSearch.toLowerCase();
        return universities.filter(
            (u) => u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)
        );
    }, [uniSearch]);

    const filteredPrograms = useMemo(() => {
        if (!progSearch.trim()) return programs;
        const q = progSearch.toLowerCase();
        return programs.filter(
            (p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
        );
    }, [programs, progSearch]);

    return (
        <MainLayout>
            <Header
                title="Catalog"
                subtitle="Explore and save universities and special programs."
            />

            <div className="p-8 bg-gray-50 min-h-screen">
                <Tabs defaultValue="universities" className="w-full">
                    <TabsList className="h-11 p-1 bg-gray-200/60 rounded-xl mb-8 w-auto inline-flex">
                        <TabsTrigger
                            value="universities"
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Universities
                            <span className="ml-0.5 text-xs text-gray-400 font-normal">
                                ({universities.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="programs"
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Programs
                            <span className="ml-0.5 text-xs text-gray-400 font-normal">
                                ({programs.length})
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Universities Tab ── */}
                    <TabsContent value="universities">
                        <div className="relative max-w-lg mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Search universities…"
                                value={uniSearch}
                                onChange={(e) => setUniSearch(e.target.value)}
                                className="pl-12 h-12 text-base bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-[#C26E26]"
                            />
                        </div>

                        {filteredUniversities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredUniversities.map((uni) => (
                                    <UniversityCard key={uni.id} university={uni} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-900 font-medium text-lg mb-1">No universities found</p>
                                <p className="text-gray-500 text-sm">
                                    Try searching with a different name or country.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Programs Tab ── */}
                    <TabsContent value="programs">
                        <div className="relative max-w-lg mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder="Search programs…"
                                value={progSearch}
                                onChange={(e) => setProgSearch(e.target.value)}
                                className="pl-12 h-12 text-base bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-purple-500"
                            />
                        </div>

                        {filteredPrograms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPrograms.map((prog) => (
                                    <ProgramCard key={prog.id} program={prog} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-900 font-medium text-lg mb-1">No programs found</p>
                                <p className="text-gray-500 text-sm">
                                    Try searching with a different name.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
