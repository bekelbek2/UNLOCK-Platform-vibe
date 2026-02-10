import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Sidebar />
            <main className="ml-[280px] min-h-screen">
                {children}
            </main>
        </div>
    );
}
