
import React, { useState } from 'react';
import { useAuth } from '../context/AppContext';
import { User, Role } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

const UserManager: React.FC = () => {
    const { users, addUser, deleteUser } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: Role.TEACHER });
    const [error, setError] = useState('');

    const handleDelete = async (user: User) => {
        if(window.confirm(`Estàs segur que vols eliminar l'usuari "${user.name}"? S'esborraran totes les seves reserves.`)) {
            try {
                await deleteUser(user.id);
            } catch (error) {
                alert('No s\'ha pogut eliminar l\'usuari.');
            }
        }
    };
    
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await addUser(newUser);
            setIsAdding(false);
            setNewUser({ name: '', email: '', role: Role.TEACHER });
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Llista d'Usuaris</h3>
                <button onClick={() => setIsAdding(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nou Usuari
                </button>
            </div>
            
            {isAdding && (
                 <form onSubmit={handleAddUser} className="bg-gray-50 p-4 rounded-lg mb-4 border">
                    <h4 className="font-semibold mb-2">Afegir nou usuari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nom complet" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="p-2 border rounded" required />
                        <input type="email" placeholder="correu@xtec.cat" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="p-2 border rounded" required />
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="p-2 border rounded">
                            <option value={Role.TEACHER}>Professor/a</option>
                            <option value={Role.ADMIN}>Administrador</option>
                        </select>
                    </div>
                     {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="mt-4 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel·lar</button>
                        <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Guardar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                       {user.role}
                                   </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;
