'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import ActivitiesTab from '@/components/forms/ActivitiesTab';
import HonorsTab from '@/components/forms/HonorsTab';

const sectionTabs = [
    { id: 'activities', label: 'Activities' },
    { id: 'honors', label: 'Honors' },
];

export default function ActivitiesHonorsPage() {
    const [activeTab, setActiveTab] = useState('activities');

    return (
        <MainLayout>
            <Header
                title="Activities & Honors"
                subtitle="Manage your extracurricular activities and academic honors."
            />

            <Tabs
                tabs={sectionTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="p-8 bg-gray-50">
                {activeTab === 'activities' && <ActivitiesTab />}
                {activeTab === 'honors' && <HonorsTab />}
            </div>
        </MainLayout>
    );
}
