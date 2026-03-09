'use client';

import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, GraduationCap, BookOpen, ExternalLink, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { useUniversityStore, type University } from '@/lib/universityStore';

// ─── University Card (Row Based) ──────────────────────────────────────────────────────────
function UniversityCardList({ university }: { university: University }) {
    return (
        <Card className="flex flex-col sm:flex-row items-start sm:items-center overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 p-4 gap-4 md:gap-6 bg-white group">
            {/* Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2 shadow-sm">
                {university.logo_url ? (
                    <img
                        src={university.logo_url}
                        alt={`${university.name} logo`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <GraduationCap className="w-8 h-8 text-gray-300" />
                )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 truncate group-hover:text-[#C26E26] transition-colors">
                    {university.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-500">
                        {university.city ? `${university.city}, ` : ''}{university.country}
                    </span>
                    {university.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-gray-100/80 text-gray-600 hover:bg-gray-200 font-medium border border-gray-200/50">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-row items-center gap-6 sm:gap-8 min-w-max pb-1 sm:pb-0 hide-scrollbar justify-between sm:justify-end w-full sm:w-auto">
                {/* Rank */}
                <div className="flex flex-col text-left sm:text-center w-14">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Rank</span>
                    <span className="text-base font-black text-gray-900">{university.rank ? `#${university.rank}` : '—'}</span>
                </div>

                <div className="w-px h-10 bg-gray-100 hidden sm:block" />

                {/* Acceptance */}
                <div className="flex flex-col text-left sm:text-center w-20">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Accept Rate</span>
                    <span className="text-base font-black text-gray-900">{university.acceptance_rate ? `${university.acceptance_rate}%` : '—'}</span>
                </div>

                {/* CTA */}
                {university.website_url && (
                    <div className="pl-2 sm:pl-4 border-l border-gray-100 shrink-0">
                        <a href={university.website_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700 hover:border-[#C26E26] hover:text-[#C26E26] hover:bg-orange-50/50 transition-colors shadow-sm font-semibold pr-3">
                                Visit <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                            </Button>
                        </a>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── University Card (Grid Based) ──────────────────────────────────────────────────────────
function UniversityCardGrid({ university }: { university: University }) {
    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 bg-white group">
            <div className="p-6 pb-0 flex items-center justify-between">
                <div className="w-16 h-16 shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2 shadow-sm">
                    {university.logo_url ? (
                        <img
                            src={university.logo_url}
                            alt={`${university.name} logo`}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <GraduationCap className="w-8 h-8 text-gray-300" />
                    )}
                </div>
                {university.rank && (
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Rank</span>
                        <span className="text-xl font-black text-[#C26E26]">#{university.rank}</span>
                    </div>
                )}
            </div>

            <div className="px-6 mt-5 flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#C26E26] transition-colors mb-1.5 line-clamp-2">
                    {university.name}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-3">
                    {university.city ? `${university.city}, ` : ''}{university.country}
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                    {university.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-gray-100/80 text-gray-600 font-medium border border-gray-200/50">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Accept Rate</span>
                    <span className="text-sm font-bold text-gray-900">{university.acceptance_rate ? `${university.acceptance_rate}%` : '—'}</span>
                </div>
                {university.website_url && (
                    <a href={university.website_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="text-[#C26E26] hover:bg-orange-50 hover:text-[#C26E26] p-0 h-auto font-semibold">
                            Visit <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </a>
                )}
            </div>
        </Card>
    );
}

// ─── Program Card (Row Based) ─────────────────────────────────────────────────────────────
function ProgramCardList({ program }: { program: University }) {
    return (
        <Card className="flex flex-col sm:flex-row items-start sm:items-center overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 p-4 gap-4 md:gap-6 bg-white group">
            {/* Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2 shadow-sm">
                {program.logo_url ? (
                    <img
                        src={program.logo_url}
                        alt={`${program.name} logo`}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <BookOpen className="w-8 h-8 text-purple-300" />
                )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg md:text-xl font-extrabold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {program.name}
                    </h3>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold px-2 py-0 uppercase h-5 tracking-wider shrink-0">
                        Program
                    </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-500">
                        {program.city ? `${program.city}, ` : ''}{program.country}
                    </span>
                    {program.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-gray-100/80 text-gray-600 hover:bg-gray-200 font-medium border border-gray-200/50">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-row items-center gap-6 sm:gap-8 min-w-max pb-1 sm:pb-0 hide-scrollbar justify-between sm:justify-end w-full sm:w-auto">
                {/* Acceptance */}
                <div className="flex flex-col text-left sm:text-center w-20">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Selectivity</span>
                    <span className="text-base font-black text-gray-900">{program.acceptance_rate ? `${program.acceptance_rate}%` : 'Varies'}</span>
                </div>

                {/* CTA */}
                {program.website_url && (
                    <div className="pl-2 sm:pl-4 border-l border-gray-100 shrink-0">
                        <a href={program.website_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50/50 transition-colors shadow-sm font-semibold pr-3">
                                Explore <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                            </Button>
                        </a>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── Program Card (Grid Based) ─────────────────────────────────────────────────────────────
function ProgramCardGrid({ program }: { program: University }) {
    return (
        <Card className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 bg-white group">
            <div className="p-6 pb-0 flex items-start justify-between">
                <div className="w-16 h-16 shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center p-2 shadow-sm">
                    {program.logo_url ? (
                        <img
                            src={program.logo_url}
                            alt={`${program.name} logo`}
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <BookOpen className="w-8 h-8 text-purple-300" />
                    )}
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shrink-0 mt-1">
                    Program
                </Badge>
            </div>

            <div className="px-6 mt-5 flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors mb-1.5 line-clamp-2">
                    {program.name}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-3">
                    {program.city ? `${program.city}, ` : ''}{program.country}
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                    {program.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-gray-100/80 text-gray-600 font-medium border border-gray-200/50">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Selectivity</span>
                    <span className="text-sm font-bold text-gray-900">{program.acceptance_rate ? `${program.acceptance_rate}%` : 'Varies'}</span>
                </div>
                {program.website_url && (
                    <a href={program.website_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 p-0 h-auto font-semibold">
                            Explore <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </a>
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

    const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');

    const [uniSearch, setUniSearch] = useState('');
    const [uniCountry, setUniCountry] = useState('all');
    const [uniSort, setUniSort] = useState('rank-asc');

    const [progSearch, setProgSearch] = useState('');

    const uniCountries = useMemo(() => {
        const set = new Set<string>();
        universities.forEach((u) => set.add(u.country));
        return Array.from(set).sort();
    }, [universities]);

    const filteredUniversities = useMemo(() => {
        let res = universities;

        // Search
        if (uniSearch.trim()) {
            const q = uniSearch.toLowerCase();
            res = res.filter((u) => u.name.toLowerCase().includes(q));
        }

        // Country Filter
        if (uniCountry !== 'all') {
            res = res.filter((u) => u.country === uniCountry);
        }

        // Sorting
        res = [...res].sort((a, b) => {
            if (uniSort === 'rank-asc') {
                return (a.rank ?? 9999) - (b.rank ?? 9999);
            }
            if (uniSort === 'acc-asc') {
                return (a.acceptance_rate ?? 100) - (b.acceptance_rate ?? 100);
            }
            if (uniSort === 'acc-desc') {
                return (b.acceptance_rate ?? 0) - (a.acceptance_rate ?? 0);
            }
            if (uniSort === 'name-asc') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

        return res;
    }, [universities, uniSearch, uniCountry, uniSort]);

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
                    {/* Top Controls Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <TabsList className="h-11 p-1 bg-gray-200/60 rounded-xl w-auto inline-flex">
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

                        {/* Layout Toggle */}
                        <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewLayout('list')}
                                className={`h-8 px-3 rounded-md transition-all ${viewLayout === 'list'
                                        ? 'bg-gray-100 text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <List className="w-4 h-4 mr-1.5" />
                                <span className="text-sm font-semibold">List</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewLayout('grid')}
                                className={`h-8 px-3 rounded-md transition-all ${viewLayout === 'grid'
                                        ? 'bg-gray-100 text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4 mr-1.5" />
                                <span className="text-sm font-semibold">Grid</span>
                            </Button>
                        </div>
                    </div>

                    {/* ── Universities Tab ── */}
                    <TabsContent value="universities">
                        <div className="flex flex-col lg:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <Input
                                    placeholder="Search by university name..."
                                    value={uniSearch}
                                    onChange={(e) => setUniSearch(e.target.value)}
                                    className="pl-12 h-12 text-base bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-[#C26E26]"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Select value={uniCountry} onValueChange={setUniCountry}>
                                    <SelectTrigger className="w-[180px] h-12 bg-white border-gray-200 rounded-xl shadow-sm text-base">
                                        <SelectValue placeholder="All Countries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Countries</SelectItem>
                                        {uniCountries.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={uniSort} onValueChange={setUniSort}>
                                    <SelectTrigger className="w-[200px] h-12 bg-white border-gray-200 rounded-xl shadow-sm text-base">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rank-asc">Highest Rank</SelectItem>
                                        <SelectItem value="acc-asc">Lowest Acceptance Rate</SelectItem>
                                        <SelectItem value="acc-desc">Highest Acceptance Rate</SelectItem>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {!isMounted ? (
                            <div className={viewLayout === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
                                {[...Array(viewLayout === 'list' ? 4 : 8)].map((_, i) => (
                                    <Card key={i} className={`p-4 animate-pulse border-gray-200 ${viewLayout === 'list' ? 'flex items-center gap-6' : 'flex flex-col'}`}>
                                        <div className={`w-16 h-16 rounded-xl bg-gray-200 shrink-0 ${viewLayout === 'grid' ? 'mb-4' : ''}`} />
                                        <div className={`flex-1 ${viewLayout === 'grid' ? 'w-full' : ''}`}>
                                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
                                            <div className="h-4 w-1/4 bg-gray-100 rounded" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredUniversities.length > 0 ? (
                            <div className={viewLayout === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 gap-4'}>
                                {filteredUniversities.map((uni) => (
                                    viewLayout === 'list'
                                        ? <UniversityCardList key={uni.id} university={uni} />
                                        : <UniversityCardGrid key={uni.id} university={uni} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <GraduationCap className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-bold text-xl mb-1">No universities found</p>
                                <p className="text-gray-500 text-sm">
                                    Adjust your search or filters to find what you're looking for.
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
                            <div className={viewLayout === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
                                {[...Array(viewLayout === 'list' ? 3 : 6)].map((_, i) => (
                                    <Card key={i} className={`p-4 animate-pulse border-gray-200 ${viewLayout === 'list' ? 'flex items-center gap-6' : 'flex flex-col'}`}>
                                        <div className={`w-16 h-16 rounded-xl bg-gray-200 shrink-0 ${viewLayout === 'grid' ? 'mb-4' : ''}`} />
                                        <div className={`flex-1 ${viewLayout === 'grid' ? 'w-full' : ''}`}>
                                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
                                            <div className="h-4 w-1/4 bg-gray-100 rounded" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredPrograms.length > 0 ? (
                            <div className={viewLayout === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 gap-4'}>
                                {filteredPrograms.map((prog) => (
                                    viewLayout === 'list'
                                        ? <ProgramCardList key={prog.id} program={prog} />
                                        : <ProgramCardGrid key={prog.id} program={prog} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                                    <BookOpen className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-gray-900 font-bold text-xl mb-1">No programs found</p>
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
