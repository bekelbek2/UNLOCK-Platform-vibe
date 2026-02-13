'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import PersonalTab from '@/components/forms/PersonalTab';
import FamilyTab from '@/components/forms/FamilyTab';
import EducationTab from '@/components/forms/EducationTab';
import TestScoresTab from '@/components/forms/TestScoresTab';
import FinanceTab from '@/components/forms/FinanceTab';
import { EssaysTab } from '@/components/profile/EssaysTab';
import { RecommendationsTab } from '@/components/profile/RecommendationsTab';
import { useProfileData } from '@/lib/profileStore';
import { Button } from '@/components/ui/button';
import { ProfilePreviewModal } from '@/components/pdf/ProfilePreviewModal';

const profileTabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'family', label: 'Family' },
    { id: 'education', label: 'Education' },
    { id: 'test-scores', label: 'Test Scores' },
    { id: 'finance', label: 'Finance' },
    { id: 'essays', label: 'Essays' },
    { id: 'recommendations', label: 'Recommendation Letters' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal');
    const { data } = useProfileData();
    const [isClient, setIsClient] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);



    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                        <p className="text-gray-500 mt-2">
                            Manage your personal and academic information.
                        </p>
                    </div>
                    {isClient && (
                        <Button variant="outline" className="gap-2" onClick={() => setShowPreview(true)}>
                            <Eye className="h-4 w-4" />
                            Preview Profile
                        </Button>
                    )}
                </div>

                <Tabs tabs={profileTabs} activeTab={activeTab} onTabChange={setActiveTab} />

                <ProfilePreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    data={data}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {activeTab === 'personal' && <PersonalTab />}

                    {activeTab === 'family' && <FamilyTab />}

                    {activeTab === 'education' && <EducationTab />}

                    {activeTab === 'test-scores' && <TestScoresTab />}

                    {activeTab === 'finance' && <FinanceTab />}

                    {activeTab === 'essays' && <EssaysTab />}
                    {activeTab === 'recommendations' && <RecommendationsTab />}
                </div>
            </div>
        </MainLayout>
    );
}
