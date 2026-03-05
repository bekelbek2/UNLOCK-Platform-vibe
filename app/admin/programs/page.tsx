'use client';

import Link from 'next/link';
import { useProgramStore } from '@/lib/programStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, DollarSign, ChevronRight, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminProgramsPage() {
    const { programs, getLessonsByProgram, getTotalHours, getTotalPrice } = useProgramStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const programMeta: Record<string, { color: string; gradient: string }> = {
        'prog-powder': { color: 'text-violet-600', gradient: 'from-violet-500 to-purple-600' },
        'prog-360': { color: 'text-[#C26E26]', gradient: 'from-[#C26E26] to-orange-500' },
        'prog-ambulance': { color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' },
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage UNLOCK program curriculums, lesson hours, and pricing.
                </p>
            </div>

            {/* Program Cards */}
            {!mounted ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#C26E26] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {programs.map((program) => {
                        const lessons = getLessonsByProgram(program.id);
                        const totalHours = getTotalHours(program.id);
                        const totalPrice = getTotalPrice(program.id);
                        const meta = programMeta[program.id] || { color: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' };
                        const fixedCount = lessons.filter(l => !l.isFlexible).length;
                        const flexCount = lessons.filter(l => l.isFlexible).length;

                        return (
                            <Link key={program.id} href={`/admin/programs/${program.slug}`}>
                                <Card className="h-full border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group cursor-pointer overflow-hidden">
                                    {/* Colored top bar */}
                                    <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
                                    <CardContent className="p-6">
                                        {/* Title */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#C26E26] transition-colors">
                                                    {program.name}
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                    {program.description}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C26E26] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3 mt-6">
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <BookOpen className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-lg font-bold text-gray-900">{lessons.length}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Lessons</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-lg font-bold text-gray-900">{totalHours.toFixed(1)}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Hours</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                                <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-lg font-bold text-gray-900">${totalPrice}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Price</p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex gap-2 mt-4 flex-wrap">
                                            {fixedCount > 0 && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                                                    {fixedCount} fixed
                                                </Badge>
                                            )}
                                            {flexCount > 0 && (
                                                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 text-xs">
                                                    {flexCount} flexible
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
