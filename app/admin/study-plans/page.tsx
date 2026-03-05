'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, MoreHorizontal, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useStudyPlanStore, type StudyPlan } from '@/lib/studyPlanStore';
import { toast } from 'sonner';

export default function AdminStudyPlansPage() {
    const { studyPlans, deleteStudyPlan } = useStudyPlanStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getStatusColor = (status: StudyPlan['status']) => {
        switch (status) {
            case 'New': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Completed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Plans</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and create tailored curriculum plans for students.</p>
                </div>
                <Link href="/admin/study-plans/new">
                    <Button className="bg-[#C26E26] hover:bg-[#a65d1f] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Study Plan
                    </Button>
                </Link>
            </div>

            {/* Table Area */}
            <Card className="shadow-sm border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="relative w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search students..." className="pl-9 h-9 text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Program</th>
                                <th className="px-6 py-4">Mentors</th>
                                <th className="px-6 py-4">Total Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {!mounted ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading study plans...
                                    </td>
                                </tr>
                            ) : studyPlans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-10 h-10 text-gray-300 mb-3" />
                                            <p className="text-gray-900 font-medium text-base mb-1">No study plans yet</p>
                                            <p className="text-sm">Create the first study plan to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                studyPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{plan.studentName}</div>
                                            <div className="text-xs text-gray-500 mt-1">Grade {plan.studentStats.grade} • {plan.studentStats.targetMajor || 'Undecided'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{plan.programName}</div>
                                            <div className="text-xs text-gray-500 mt-1">{plan.totalHours}h / {plan.resolvedSessions.length + (plan.xSessions?.length || 0)} sessions</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {plan.mentors.map((m, i) => (
                                                    <div key={i} className="text-[11px] flex items-center gap-1">
                                                        <span className="text-gray-400 font-medium w-16">{m.role}:</span>
                                                        <span className="font-semibold text-gray-700">{m.mentorName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {formatCurrency(plan.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(plan.status)}`}>
                                                {plan.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                onClick={() => {
                                                    deleteStudyPlan(plan.id);
                                                    toast.success('Study plan deleted');
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
