'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyPlanStore, type StudyPlan } from '@/lib/studyPlanStore';
import { useUniversityStore } from '@/lib/universityStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User as UserIcon, BookOpen, Clock, DollarSign, Target, Shield, Layers, Plus, Edit, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudyPlanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.id as string;

    const { studyPlans, updateStudyPlanStatus } = useStudyPlanStore();
    const { universities } = useUniversityStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const plan = useMemo(() => studyPlans.find(p => p.id === planId), [studyPlans, planId]);

    const categorizedTargets = useMemo(() => {
        if (!plan || !plan.targets) return null;
        const categories = { Reach: [], Match: [], Safety: [], Uncategorized: [] } as Record<string, typeof plan.targets>;
        plan.targets.forEach(target => {
            const uni = universities.find(u => u.id === target.universityId);
            if (uni && uni.acceptance_rate !== null && uni.acceptance_rate !== undefined) {
                if (uni.acceptance_rate < 20) categories.Reach.push(target);
                else if (uni.acceptance_rate <= 50) categories.Match.push(target);
                else categories.Safety.push(target);
            } else {
                categories.Uncategorized.push(target);
            }
        });
        return categories;
    }, [plan, universities]);

    if (!mounted) return null;

    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Study plan not found.</p>
                    <Button variant="outline" onClick={() => router.push('/admin/study-plans')}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Study Plans
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: StudyPlan['status']) => {
        switch (status) {
            case 'New': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Completed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Group resolved sessions by category
    const categorizedSessions = Array.from(
        plan.resolvedSessions.reduce((acc, session) => {
            const arr = acc.get(session.category) || [];
            arr.push(session);
            acc.set(session.category, arr);
            return acc;
        }, new Map<string, typeof plan.resolvedSessions>())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
                <button
                    onClick={() => router.push('/admin/study-plans')}
                    className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-[#C26E26] transition-colors mb-4"
                >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Back to Study Plans
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Study Plan: {plan.studentName}</h1>
                        <p className="text-gray-500 text-sm mt-1">Created on {new Date(plan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/study-plans/${plan.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Plan
                        </Button>
                        <Select
                            value={plan.status}
                            onValueChange={(val: StudyPlan['status']) => updateStudyPlanStatus(plan.id, val)}
                        >
                            <SelectTrigger className={`w-[140px] h-9 border font-medium ${getStatusColor(plan.status)}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8 space-y-8">
                {/* Section 1: Student Profile */}
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-[#C26E26]" />
                            Student Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Grade</p>
                                <p className="text-sm font-medium text-gray-800">{plan.studentStats.grade || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Target Major</p>
                                <p className="text-sm font-medium text-gray-800">{plan.studentStats.targetMajor || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">SAT Score</p>
                                <p className="text-sm font-medium text-gray-800">{plan.studentStats.sat || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">IELTS / TOEFL</p>
                                <p className="text-sm font-medium text-gray-800">{plan.studentStats.ielts || '—'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 1.5: Default Universities/Programs */}
                {plan.targets && plan.targets.length > 0 && categorizedTargets && (
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#C26E26]" />
                                Default Universities/Programs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {['Reach', 'Match', 'Safety', 'Uncategorized'].map(category => {
                                const items = categorizedTargets[category];
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={category}>
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            {category}
                                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {items.map((target, idx) => (
                                                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                                                            <Building2 className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 leading-tight">{target.universityName}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{target.programName}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 2: Program Overview */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[#C26E26]" />
                                Program Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-900 text-lg">{plan.programName}</h3>
                            </div>
                            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Hours</p>
                                        <p className="text-sm font-bold text-gray-800">{plan.totalHours.toFixed(1)}h</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Price</p>
                                        <p className="text-sm font-bold text-gray-800">${plan.totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Mentors */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#C26E26]" />
                                Assigned Mentors
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {plan.mentors.length === 0 ? (
                                    <p className="text-sm text-gray-500">No mentors assigned.</p>
                                ) : (
                                    plan.mentors.map((m, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{m.role}</span>
                                            <span className="text-sm font-semibold text-gray-900">{m.mentorName}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 4: Curriculum */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#C26E26]" />
                        Curriculum Mapping
                    </h2>

                    {categorizedSessions.length === 0 ? (
                        <Card className="border-dashed border-gray-200 text-center py-8 shadow-none">
                            <p className="text-gray-500 text-sm">No standard sessions in this advanced plan.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {categorizedSessions.map(([category, sessions]) => (
                                <Card key={category} className="shadow-sm border-gray-200 overflow-hidden h-full flex flex-col">
                                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3 px-4">
                                        <CardTitle className="text-sm font-bold flex items-center justify-between text-gray-700">
                                            {category}
                                            <Badge variant="secondary" className="text-xs">{sessions.length}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1">
                                        <ul className="divide-y divide-gray-100">
                                            {sessions.map((session, i) => (
                                                <li key={i} className="py-2.5 px-4 flex justify-between items-center hover:bg-gray-50">
                                                    <span className="text-sm font-medium text-gray-900">{session.name}</span>
                                                    <div className="flex items-center gap-3 text-xs font-semibold">
                                                        <span className="text-gray-500">{session.hours}h</span>
                                                        {session.price > 0 && <span className="text-emerald-600">${session.price}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section 5: X-Sessions */}
                {plan.xSessions && plan.xSessions.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[#C26E26]" />
                            Custom X-Sessions
                        </h2>
                        <Card className="shadow-sm border-gray-200 overflow-hidden">
                            <CardContent className="p-0">
                                <ul className="divide-y divide-gray-100">
                                    {plan.xSessions.map((session, i) => (
                                        <li key={i} className="py-3 px-6 flex justify-between items-center bg-orange-50/30 hover:bg-orange-50/60">
                                            <span className="text-sm font-medium text-gray-900">{session.name}</span>
                                            <Badge className="bg-white border-orange-200 text-orange-700 font-semibold">{session.hours}h</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
