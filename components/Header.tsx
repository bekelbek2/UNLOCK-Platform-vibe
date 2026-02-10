'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
}

export default function Header({ title, subtitle, showBackButton = true }: HeaderProps) {
    const router = useRouter();

    return (
        <div className="relative">
            {/* Back Button - overlapping sidebar */}
            {showBackButton && (
                <button
                    onClick={() => router.back()}
                    className="absolute -left-4 top-6 w-8 h-8 bg-[#D97706] hover:bg-[#B45309] rounded-full flex items-center justify-center text-white shadow-md transition-colors z-50"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
            )}

            {/* Title Section */}
            <div className="px-8 pt-8 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                    <p className="mt-2 text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
