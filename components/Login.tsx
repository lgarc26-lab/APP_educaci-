
import React, { useState } from 'react';
import { useAuth } from '../context/AppContext';
import { USERS } from '../constants';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [selectedUser, setSelectedUser] = useState<string>(USERS[0].id);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(selectedUser);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Gestor de Reserves d'Aules</h1>
                    <p className="mt-2 text-gray-600">Si us plau, seleccioneu el vostre usuari per continuar</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="user-select" className="sr-only">Selecciona usuari</label>
                            <select
                                id="user-select"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            >
                                {USERS.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Entra
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
