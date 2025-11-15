
import React from 'react';
import { useAuth } from '../context/AppContext';
import { Classroom } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';

// This component would have a modal for adding/editing classrooms.
// For simplicity, it just lists them with delete functionality.

const ClassroomManager: React.FC = () => {
    const { classrooms, deleteClassroom } = useAuth();

    const handleDelete = async (classroom: Classroom) => {
        if(window.confirm(`Estàs segur que vols eliminar l'aula "${classroom.name}"? S'esborraran totes les seves reserves i bloquejos.`)) {
            try {
                await deleteClassroom(classroom.id);
            } catch (error) {
                alert('No s\'ha pogut eliminar l\'aula.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Llista d'Aules</h3>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nova Aula
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacitat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipament</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {classrooms.map(classroom => (
                            <tr key={classroom.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classroom.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classroom.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classroom.equipment.join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <EditIcon className="h-5 w-5"/>
                                    </button>
                                    <button onClick={() => handleDelete(classroom)} className="text-red-600 hover:text-red-900">
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

export default ClassroomManager;
