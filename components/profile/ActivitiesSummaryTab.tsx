'use client';

import { useProfileData } from '@/lib/profileStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowUpRight, EyeOff } from 'lucide-react';

export function ActivitiesSummaryTab() {
    const { data } = useProfileData();
    const { activities } = data;

    const visibleActivities = activities?.filter(a => a.appearOnProfile) || [];

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

    if (visibleActivities.length === 0) {
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
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <EyeOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-900 font-medium mb-1">No activities set to visible.</p>
                    <p className="text-gray-500 mb-4 text-sm">Go to the dashboard to select which activities to display on your profile.</p>
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
                <h2 className="text-xl font-semibold text-gray-900">Activities Summary</h2>
                <Link href="/dashboard/activities-honors">
                    <Button variant="ghost" size="sm" className="gap-2 text-[#e75e24] hover:text-[#c24e1b] hover:bg-orange-50">
                        Manage Activities <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {visibleActivities.map((activity) => (
                    <Card key={activity.id} className="bg-gray-50 border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        {/* Read-Only Indicator strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e75e24] opacity-50"></div>

                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{activity.position}</h3>
                                        {activity.status === 'draft' && (
                                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Draft</Badge>
                                        )}
                                    </div>
                                    <p className="text-[#e75e24] font-medium mb-2 text-lg">{activity.organizationName}</p>
                                    <p className="text-gray-600 text-lg mb-3 whitespace-pre-wrap line-clamp-2">
                                        {activity.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {activity.gradeLevels && activity.gradeLevels.length > 0 && (
                                            <span className="bg-blue-50 px-3 py-1 rounded border border-blue-100 text-blue-700 font-medium">
                                                Grades: {activity.gradeLevels.join(', ')}
                                            </span>
                                        )}
                                        {activity.timing && activity.timing.length > 0 && (
                                            <span className="bg-purple-50 px-3 py-1 rounded border border-purple-100 text-purple-700 font-medium">
                                                {activity.timing.join(', ')}
                                            </span>
                                        )}
                                        <span className="bg-green-50 px-3 py-1 rounded border border-green-100 text-green-700 font-medium">
                                            {activity.hoursPerWeek} hr/wk, {activity.weeksPerYear} wk/yr
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                                        {activity.activityType}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
