'use client';

interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    return (
        <div className="px-8">
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative
                ${isActive
                                    ? 'text-[#D97706]'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D97706] rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
