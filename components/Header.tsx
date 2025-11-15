
import React from 'react';
import { useAuth } from '../context/AppContext';
import { Role } from '../types';
import { CalendarIcon, SettingsIcon, LogoutIcon } from './Icons';

interface HeaderProps {
    activeView: 'calendar' | 'admin';
    setActiveView: (view: 'calendar' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const { currentUser, logout } = useAuth();

    const NavButton: React.FC<{
        view: 'calendar' | 'admin';
        label: string;
        children: React.ReactNode;
    }> = ({ view, label, children }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === view
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-500 hover:bg-opacity-75'
            }`}
        >
            {children}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <header className="bg-indigo-600 text-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold">Gestor d'Aules</h1>
                        <nav className="hidden md:flex items-center ml-10 space-x-4">
                            <NavButton view="calendar" label="Calendari">
                                <CalendarIcon className="h-5 w-5" />
                            </NavButton>
                            {currentUser?.role === Role.ADMIN && (
                                <NavButton view="admin" label="Administració">
                                    <SettingsIcon className="h-5 w-5" />
                                </NavButton>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center">
                        <div className="text-right mr-4">
                            <div className="text-sm font-medium">{currentUser?.name}</div>
                            <div className="text-xs text-indigo-200">{currentUser?.role}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                            aria-label="Tancar sessió"
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                 {/* Mobile Nav */}
                <div className="md:hidden flex justify-center pb-2 space-x-2">
                    <NavButton view="calendar" label="Calendari">
                        <CalendarIcon className="h-5 w-5" />
                    </NavButton>
                    {currentUser?.role === Role.ADMIN && (
                         <NavButton view="admin" label="Admin">
                            <SettingsIcon className="h-5 w-5" />
                        </NavButton>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
