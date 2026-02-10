'use client';

import { CheckCircle, Circle, ChevronDown } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface ProfileSection {
    id: string;
    name: string;
    completed: boolean;
    subItems?: { id: string; name: string; completed: boolean }[];
}

const sections: ProfileSection[] = [
    { id: 'profile', name: 'Profile', completed: true },
    { id: 'family', name: 'Family', completed: false },
    { id: 'education', name: 'Education', completed: false },
    { id: 'testing', name: 'Testing', completed: false },
    {
        id: 'activities',
        name: 'Activities',
        completed: false,
        subItems: [
            { id: 'activities-list', name: 'Activities', completed: false },
            { id: 'responsibilities', name: 'Responsibilities and circumstances', completed: false },
        ],
    },
];

interface ProfileSidebarProps {
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
}

export default function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
    const getStatusIcon = (completed: boolean) => {
        return completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
            <Circle className="w-5 h-5 text-gray-300" />
        );
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-full py-4">
            <Accordion type="single" collapsible defaultValue="activities" className="w-full">
                {sections.map((section) => {
                    if (section.subItems) {
                        return (
                            <AccordionItem key={section.id} value={section.id} className="border-none">
                                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(section.completed)}
                                        <span className={`text-sm font-medium ${activeSection === section.id ? 'text-[#D97706]' : 'text-gray-700'
                                            }`}>
                                            {section.name}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-0">
                                    <div className="pl-8 space-y-1">
                                        {section.subItems.map((subItem) => (
                                            <button
                                                key={subItem.id}
                                                onClick={() => onSectionChange(subItem.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-md transition-colors
                          ${activeSection === subItem.id
                                                        ? 'bg-orange-50 text-[#D97706]'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {getStatusIcon(subItem.completed)}
                                                <span className="text-sm">{subItem.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    }

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                ${activeSection === section.id
                                    ? 'bg-orange-50 text-[#D97706] border-r-2 border-[#D97706]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {getStatusIcon(section.completed)}
                            <span className="text-sm font-medium">{section.name}</span>
                        </button>
                    );
                })}
            </Accordion>
        </div>
    );
}
