
import React, { useState } from 'react';
import { Role } from '../types';
import { useAuth } from '../context/AppContext';
import Header from './Header';
import CalendarView from './CalendarView';
import AdminPanel from './AdminPanel';

type View = 'calendar' | 'admin';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeView, setActiveView] = useState<View>('calendar');

    return (
        <div className="flex flex-col h-screen">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {activeView === 'calendar' && <CalendarView />}
                {activeView === 'admin' && currentUser?.role === Role.ADMIN && <AdminPanel />}
                {activeView === 'admin' && currentUser?.role !== Role.ADMIN && (
                    <div className="text-center text-red-500 mt-10">
                        <h2 className="text-2xl font-bold">Accés Denegat</h2>
                        <p>No teniu permisos per accedir a aquesta secció.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
