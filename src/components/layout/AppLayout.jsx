import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatPanel from './ChatPanel';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <div className="min-h-screen bg-casino-darker">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main area */}
            <div className="lg:ml-64 xl:mr-80 min-h-screen flex flex-col">
                <Header
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onToggleChat={() => setChatOpen(!chatOpen)}
                />
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Chat */}
            <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
    );
}
