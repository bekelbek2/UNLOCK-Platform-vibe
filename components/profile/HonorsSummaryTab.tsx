'use client';

import { useProfileData } from '@/lib/profileStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowUpRight, Award, EyeOff } from 'lucide-react';

export function HonorsSummaryTab() {
    const { data } = useProfileData();
    const { honors } = data;

    const visibleHonors = honors?.filter(h => h.appearOnProfile) || [];

    if (!honors || honors.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">No honors added yet.</p>
                <Link href="/dashboard/activities-honors">
                    <Button variant="outline" className="gap-2">
                        Go to Activities Dashboard <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    if (visibleHonors.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Honors Summary</h2>
                    <Link href="/dashboard/activities-honors">
                        <Button variant="ghost" size="sm" className="gap-2 text-[#e75e24] hover:text-[#c24e1b] hover:bg-orange-50">
                            Manage Honors <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <EyeOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-900 font-medium mb-1">No honors set to visible.</p>
                    <p className="text-gray-500 mb-4 text-sm">Go to the dashboard to select which honors to display on your profile.</p>
                    <Link href="/dashboard/activities-honors">
                        <Button variant="outline" className="gap-2">
                            Manage Visibility <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Honors Summary</h2>
                <Link href="/dashboard/activities-honors">
                    <Button variant="ghost" size="sm" className="gap-2 text-[#e75e24] hover:text-[#c24e1b] hover:bg-orange-50">
                        Manage Honors <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {visibleHonors.map((honor) => (
                    <Card key={honor.id} className="bg-gray-50 border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Read-Only Indicator strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e75e24] opacity-50"></div>

                        <CardContent className="p-5 pl-7 flex items-start gap-4">
                            <div className="bg-white p-2 rounded-full border border-gray-100 text-[#e75e24] flex-shrink-0">
                                <Award className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{honor.title}</h3>
                                    {honor.status === 'draft' && (
                                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Draft</Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                                    <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                        Grade Level: {honor.gradeLevels?.join(', ')}
                                    </span>
                                    <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                        Level of Recognition: {honor.recognitionLevels?.join(', ')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
