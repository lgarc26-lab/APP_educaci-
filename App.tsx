
import React, { useState } from 'react';
import { AppProvider, useAuth } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {currentUser ? <Dashboard /> : <Login />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
