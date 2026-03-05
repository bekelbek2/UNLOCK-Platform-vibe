'use client';

import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, GraduationCap, CalendarClock, BookOpen, Loader2 } from 'lucide-react';
import { useUniversityStore, type University } from '@/lib/universityStore';

// ─── University Card ──────────────────────────────────────────────────────────
function UniversityCard({ university }: { university: University }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200">
            <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1">
                    {university.logo_url ? (
                        <img
                            src={university.logo_url}
                            alt={`${university.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <GraduationCap className="w-8 h-8 text-gray-300" />
                    )}
                </div>
            </div>

            <div className="px-6 mt-4">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#C26E26] transition-colors">
                    {university.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{university.country}</p>
            </div>

            <div className="px-6 pb-6 mt-4 space-y-3">
                {university.rank && (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Rank</span>
                            <span className="font-semibold text-gray-900">#{university.rank}</span>
                        </div>
                        <div className="w-full h-px bg-gray-100" />
                    </>
                )}
                {university.acceptance_rate && (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Acceptance</span>
                            <span className="font-semibold text-gray-900">{university.acceptance_rate}%</span>
                        </div>
                        <div className="w-full h-px bg-gray-100" />
                    </>
                )}
                {university.website_url && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Website</span>
                        <a
                            href={university.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[#e75e24] hover:underline truncate max-w-[160px]"
                        >
                            Visit →
                        </a>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ program }: { program: University }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-gray-200">
            <div className="flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-1">
                    {program.logo_url ? (
                        <img
                            src={program.logo_url}
                            alt={`${program.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <BookOpen className="w-8 h-8 text-purple-300" />
                    )}
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
                {program.website_url && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Website</span>
                        <a
                            href={program.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-purple-600 hover:underline truncate max-w-[160px]"
                        >
                            Visit →
                        </a>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
    const { universities: catalog } = useUniversityStore();

    // Derived universities & programs
    const universities = catalog.filter((row: University) => row.type === 'university');
    const programs = catalog.filter((row: University) => row.type === 'program');

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [uniSearch, setUniSearch] = useState('');
    const [progSearch, setProgSearch] = useState('');

    const filteredUniversities = useMemo(() => {
        if (!uniSearch.trim()) return universities;
        const q = uniSearch.toLowerCase();
        return universities.filter(
            (u) => u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)
        );
    }, [universities, uniSearch]);

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

                        {!isMounted ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="p-6 animate-pulse border-gray-200">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-md bg-gray-200" />
                                        </div>
                                        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 mx-auto" />
                                        <div className="h-4 w-1/2 bg-gray-100 rounded mx-auto mb-4" />
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-100 rounded" />
                                            <div className="h-4 bg-gray-100 rounded" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredUniversities.length > 0 ? (
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

                        {!isMounted ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="p-6 animate-pulse border-gray-200">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-md bg-gray-200" />
                                        </div>
                                        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 mx-auto" />
                                        <div className="h-4 w-1/2 bg-gray-100 rounded mx-auto" />
                                    </Card>
                                ))}
                            </div>
                        ) : filteredPrograms.length > 0 ? (
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
