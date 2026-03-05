import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <AdminSidebar />
            <main className="ml-[280px] min-h-screen">
                {children}
            </main>
        </div>
    );
}
