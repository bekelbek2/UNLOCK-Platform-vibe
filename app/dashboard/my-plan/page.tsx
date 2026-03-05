'use client';

import { useEffect, useState } from 'react';

export interface StudyPlan {
    id: string;
    studentName: string;
    studentStats: { grade: string; targetMajor: string };
    programType: string;
    totalPrice: number;
    status: 'New' | 'In Progress' | 'Completed';
    mentors: { id: string; name: string; skill: string; hours: string | number }[];
}
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, GraduationCap, MapPin, Sparkles, Star, User, BookOpen, Clock } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function StudentMyPlanPage() {
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // Mock delay
                await new Promise(res => setTimeout(res, 500));

                const mockPlan: StudyPlan = {
                    id: 'plan-1',
                    studentName: 'Demo Student',
                    studentStats: { grade: '12', targetMajor: 'Computer Science' },
                    programType: '360 Full-Support',
                    totalPrice: 4500,
                    status: 'In Progress',
                    mentors: [
                        { id: 'm1', name: 'Alina F.', skill: 'Strategic Admission', hours: 'Unlimited' },
                        { id: 'm2', name: 'John D.', skill: 'Essay Writing', hours: 10 }
                    ]
                };

                setPlan(mockPlan);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAFA]">
                    <p className="text-gray-500 animate-pulse">Loading your custom study plan...</p>
                </div>
            </MainLayout>
        );
    }

    if (!plan) {
        return (
            <MainLayout>
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FAFAFA]">
                    <GraduationCap className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Study Plan Yet</h2>
                    <p className="text-gray-500 text-center max-w-md">
                        Your Head Mentor is currently crafting your personalized roadmap. Check back soon!
                    </p>
                </div>
            </MainLayout>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#FAFAFA] pb-32">
                {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
                <section className="relative px-8 pt-20 pb-24 overflow-hidden border-b border-gray-200">
                    <div className="absolute inset-0 bg-[#C26E26]/[0.02]" />
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#C26E26]/5 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#C26E26]/5 blur-3xl rounded-full pointer-events-none" />

                    <div className="max-w-4xl mx-auto relative z-10 text-center">
                        <Badge className="bg-[#C26E26]/10 text-[#C26E26] border-[#C26E26]/20 px-3 py-1 mb-6 text-sm font-medium hover:bg-[#C26E26]/10">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Your Custom Proposal
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a1a1a] tracking-tight mb-6 leading-tight">
                            The {plan.programType} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C26E26] to-[#d68b4b]">
                                Roadmap
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
                            Welcome, {plan.studentName}. Based on your profile and target major in <strong className="text-gray-900 font-semibold">{plan.studentStats.targetMajor}</strong>, this is your precise path to admission.
                        </p>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto px-8 py-16 space-y-24">

                    {/* ─── Section A: UNLOCK Proof of Work ─────────────────────────────────── */}
                    <section>
                        <div className="mb-10 text-center">
                            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-3">The UNLOCK Advantage</h2>
                            <h3 className="text-3xl font-bold text-gray-900">Proven Results at Elite Institutions.</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { uni: 'Harvard University', stat: '$80,000 /yr Scholarship', type: 'Full Ride' },
                                { uni: 'NUS', stat: 'Asean Scholarship', type: 'Full Tuition + Stipend' },
                                { uni: 'NYU Abu Dhabi', stat: 'Fully Funded', type: 'Tuition, Housing, Flights' },
                            ].map((item, i) => (
                                <Card key={i} className="bg-[#111] border-none text-white shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C26E26]/20 blur-2xl rounded-full" />
                                    <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Star className="w-6 h-6 text-[#C26E26]" fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-1">{item.type}</p>
                                            <p className="text-lg font-bold text-white mb-0.5">{item.uni}</p>
                                            <p className="text-2xl font-black text-[#C26E26]">{item.stat}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* ─── Section B: Your Mentors ────────────────────────────────────────── */}
                    <section>
                        <div className="mb-10">
                            <h2 className="text-sm font-bold tracking-widest text-[#C26E26] uppercase mb-3">Your Support Team</h2>
                            <h3 className="text-3xl font-bold text-gray-900">World-Class Mentorship.</h3>
                            <p className="text-lg text-gray-500 mt-2 max-w-2xl">
                                You are not doing this alone. We've assigned specialized mentors to guide every aspect of your application.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plan.mentors.map((mentor) => (
                                <Card key={mentor.id} className="border-gray-200 shadow-sm hover:shadow-md transition-all">
                                    <CardContent className="p-6 flex items-start gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-8 h-8 text-[#C26E26]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">{mentor.name}</h4>
                                            <p className="text-sm font-medium text-[#C26E26] mb-3">{mentor.skill}</p>

                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-sm font-medium text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {mentor.hours === 'Unlimited' ? 'Unlimited Support' : `${mentor.hours} Hours Allocated`}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* ─── Section C: Curriculum & Deliverables ───────────────────────────── */}
                    <section className="bg-white rounded-3xl p-10 md:p-14 border border-gray-200 shadow-sm">
                        <div className="mb-10 text-center">
                            <h2 className="text-sm font-bold tracking-widest text-[#C26E26] uppercase mb-3 text-center">The Roadmap</h2>
                            <h3 className="text-3xl font-bold text-gray-900 text-center">What We Will Deliver.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {[
                                'Strategic Admissions Positioning',
                                'Target University Selection & Categorization',
                                'Personal Statement Ideation & Revisions',
                                'Supplemental Essay Architecture',
                                'Extracurricular Activities Optimization',
                                'Letters of Recommendation Strategy',
                                'Interview Preparation & Mock Sessions',
                                'Final Application Polish & Submission',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="mt-0.5">
                                        <CheckCircle2 className="w-6 h-6 text-[#C26E26]" />
                                    </div>
                                    <p className="font-medium text-gray-800 text-lg leading-snug">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* ─── Bottom CTA & Pricing ───────────────────────────────────────────── */}
                <section className="bg-[#111] text-white py-24 mb-0">
                    <div className="max-w-3xl mx-auto px-8 text-center">
                        <Badge className="bg-white/10 text-white border-white/20 mb-6 hover:bg-white/10">
                            Secure Your Spot
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to execute?</h2>
                        <p className="text-lg text-gray-400 mb-12">
                            Total investment for the <span className="text-white font-semibold">{plan.programType}</span> program, including all mentors and deliverables.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 mb-10 inline-block w-full max-w-md backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C26E26] to-transparent opacity-50" />
                            <p className="text-sm font-bold tracking-widest text-[#C26E26] uppercase mb-2">Total Price</p>
                            <div className="text-5xl font-black tracking-tight">
                                {formatCurrency(plan.totalPrice)}
                            </div>
                        </div>

                        <div>
                            <Button className="bg-[#C26E26] hover:bg-[#a65d1f] text-white h-14 px-10 text-lg font-bold shadow-xl shadow-[#C26E26]/20 transition-all hover:scale-105 active:scale-95">
                                Accept & Proceed to Payment
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
                                <BookOpen className="w-4 h-4" /> By accepting, you agree to UNLOCK's terms and conditions.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
