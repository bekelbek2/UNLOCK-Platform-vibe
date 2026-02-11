'use client';

import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import { LayoutDashboard, User, Award, Building2, CheckSquare, FileText, Video, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { name: 'Profile', href: '/profile', icon: User, description: 'Manage your personal information', color: 'bg-blue-50 text-blue-600' },
  { name: 'Activities & Honors', href: '/dashboard/activities-honors', icon: Award, description: 'Track extracurriculars and awards', color: 'bg-amber-50 text-amber-600' },
  { name: 'Applications', href: '/applications', icon: Building2, description: 'View and manage applications', color: 'bg-green-50 text-green-600' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'Stay on top of deadlines', color: 'bg-purple-50 text-purple-600' },
  { name: 'Documents', href: '/documents', icon: FileText, description: 'Upload and organize documents', color: 'bg-rose-50 text-rose-600' },
  { name: 'Sessions', href: '/sessions', icon: Video, description: 'Book counseling sessions', color: 'bg-indigo-50 text-indigo-600' },
];

export default function DashboardPage() {
  return (
    <MainLayout>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your application progress."
      />

      <div className="p-8 bg-gray-50 min-h-[calc(100vh-120px)]">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Profile Completion</h3>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-700">Getting Started</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#D97706] h-2 rounded-full transition-all" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Applications</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500">applications started</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CheckSquare className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Tasks</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500">tasks pending</p>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${link.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#D97706] transition-colors">
                    {link.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 ml-12">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
