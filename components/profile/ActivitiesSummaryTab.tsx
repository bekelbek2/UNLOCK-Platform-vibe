'use client';

import { useProfileData } from '@/lib/profileStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function ActivitiesSummaryTab() {
    const { data } = useProfileData();
    const { activities } = data;

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">No activities added yet.</p>
                <Link href="/dashboard/activities-honors">
                    <Button variant="outline" className="gap-2">
                        Go to Activities Dashboard <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Activities Summary</h2>
                <Link href="/dashboard/activities-honors">
                    <Button variant="ghost" size="sm" className="gap-2 text-[#e75e24] hover:text-[#c24e1b] hover:bg-orange-50">
                        Manage Activities <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {activities.map((activity) => (
                    <Card key={activity.id} className="bg-gray-50 border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Read-Only Indicator strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e75e24] opacity-50"></div>

                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{activity.position}</h3>
                                    <p className="text-[#e75e24] font-medium mb-2">{activity.organizationName}</p>
                                    <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap line-clamp-2">
                                        {activity.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                        <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                            Grades: {activity.gradeLevels?.join(', ')}
                                        </span>
                                        <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                            {activity.timing?.join(', ')}
                                        </span>
                                        <span className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                            {activity.hoursPerWeek} hr/wk, {activity.weeksPerYear} wk/yr
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                                    {activity.activityType}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
