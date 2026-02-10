'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import PersonalTab from '@/components/forms/PersonalTab';
import FamilyTab from '@/components/forms/FamilyTab';
import EducationTab from '@/components/forms/EducationTab';
import TestScoresTab from '@/components/forms/TestScoresTab';
import FinanceTab from '@/components/forms/FinanceTab';

const profileTabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'family', label: 'Family' },
    { id: 'education', label: 'Education' },
    { id: 'test-scores', label: 'Test Scores' },
    { id: 'finance', label: 'Finance' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal');

    return (
        <MainLayout>
            <Header
                title="Profile"
                subtitle="Manage your personal and academic information."
            />

            <Tabs
                tabs={profileTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Content Area */}
            <div className="p-8 bg-gray-50">
                {activeTab === 'personal' && <PersonalTab />}

                {activeTab === 'family' && <FamilyTab />}

                {activeTab === 'education' && <EducationTab />}

                {activeTab === 'test-scores' && <TestScoresTab />}

                {activeTab === 'finance' && <FinanceTab />}
            </div>
        </MainLayout>
    );
}

