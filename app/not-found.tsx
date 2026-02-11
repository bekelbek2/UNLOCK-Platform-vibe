'use client';

import MainLayout from '@/components/MainLayout';
import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    {/* Icon */}
                    <div className="mx-auto mb-6 p-4 bg-amber-50 rounded-full w-fit">
                        <FileQuestion className="w-16 h-16 text-[#D97706]" />
                    </div>

                    {/* Text */}
                    <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Page Not Found</h2>
                    <p className="text-gray-500 mb-8">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>

                    {/* Action */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
