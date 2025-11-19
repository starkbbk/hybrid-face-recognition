import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'camera', label: 'Live Camera', icon: '📷' },
        { id: 'logs', label: 'Logs', icon: '📜' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="sidebar h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    AI
                </div>
                <h1 className="text-xl font-bold tracking-wider text-white">HybridFace</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="mr-3">{tab.icon}</span>
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className="p-4 text-xs text-gray text-center border-t border-slate-700">
                v1.0.0 Local
            </div>
        </div>
    );
}
