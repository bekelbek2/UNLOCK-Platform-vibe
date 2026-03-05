'use client';

import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of your admin panel. More features coming soon.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-20 h-20 rounded-2xl bg-[#e75e24]/10 flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-10 h-10 text-[#e75e24]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Coming Soon</h2>
                <p className="text-gray-500 text-center max-w-md">
                    This is your admin home. Analytics, student overview, and quick actions will live here.
                    For now, head to <a href="/admin/study-plans" className="text-[#e75e24] font-medium hover:underline">Study Plans</a> to get started.
                </p>
            </div>
        </div>
    );
}
