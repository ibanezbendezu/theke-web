import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex h-full min-w-0 flex-1 flex-col bg-background">
                <Topbar isSidebarOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
