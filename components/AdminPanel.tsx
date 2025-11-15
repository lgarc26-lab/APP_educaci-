
import React, { useState } from 'react';
import ClassroomManager from './ClassroomManager';
import UserManager from './UserManager';
import AdminSettings from './AdminSettings';
import { ClassroomIcon, UsersIcon, SettingsIcon } from './Icons';

type AdminTab = 'classrooms' | 'users' | 'settings';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('classrooms');

    const TabButton: React.FC<{ tab: AdminTab; label: string; children: React.ReactNode }> = ({ tab, label, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {children}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Panell d'Administració</h2>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tab="classrooms" label="Gestionar Aules">
                        <ClassroomIcon className="h-5 w-5" />
                    </TabButton>
                    <TabButton tab="users" label="Gestionar Usuaris">
                        <UsersIcon className="h-5 w-5" />
                    </TabButton>
                     <TabButton tab="settings" label="Configuració">
                        <SettingsIcon className="h-5 w-5" />
                    </TabButton>
                </nav>
            </div>
            <div>
                {activeTab === 'classrooms' && <ClassroomManager />}
                {activeTab === 'users' && <UserManager />}
                {activeTab === 'settings' && <AdminSettings />}
            </div>
        </div>
    );
};

export default AdminPanel;
