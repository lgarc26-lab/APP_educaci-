
import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AppContext';
import { ImportData } from '../types';

const AdminSettings: React.FC = () => {
    const { importConfiguration } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/json') {
                setFile(selectedFile);
                setError('');
                setSuccess('');
            } else {
                setError('Si us plau, seleccioneu un fitxer JSON vàlid.');
                setFile(null);
            }
        }
    };

    const handleImport = useCallback(async () => {
        if (!file) {
            setError('Primer heu de seleccionar un fitxer.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('No s\'ha pogut llegir el fitxer.');
                }
                const data: ImportData = JSON.parse(text);

                // Basic validation
                if (!data.classrooms && !data.users && !data.settings) {
                    throw new Error('El fitxer JSON està buit o té un format incorrecte. Ha de contenir almenys una de les claus: "classrooms", "users", "settings".');
                }

                await importConfiguration(data);
                setSuccess('La configuració s\'ha importat correctament. Les reserves de l\'any anterior han estat esborrades.');
                setFile(null);
            } catch (err: any) {
                setError(`Error en la importació: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Hi ha hagut un error en llegir el fitxer.');
            setIsLoading(false);
        };
        reader.readAsText(file);
    }, [file, importConfiguration]);

    const exampleJson = `{
  "settings": {
    "schoolYear": "2024-2025",
    "classGroups": ["1r ESO A", "1r ESO B", "2n ESO A"],
    "subjects": ["Matemàtiques", "Llengua Catalana", "Tecnologia"]
  },
  "classrooms": [
    { "name": "Aula de Teoria 1", "capacity": 30, "equipment": ["Pissarra", "Projector"] },
    { "name": "Aula d'Informàtica", "capacity": 25, "equipment": ["Ordinadors"] }
  ],
  "users": [
    { "name": "Jordi Pons", "email": "jpons@xtec.cat", "role": "Professor/a" },
    { "name": "Marta Puig", "email": "mpuig@xtec.cat", "role": "Professor/a" }
  ]
}`;

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Configuració General</h3>
            
            <div className="bg-gray-50 p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800">Importar configuració de l'any escolar</h4>
                <p className="mt-1 text-sm text-gray-600">
                    Podeu iniciar un nou any escolar important les dades d'aules, usuaris i grups des d'un fitxer JSON. Això substituirà les aules i paràmetres actuals, i afegirà els usuaris nous.
                </p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mt-2 flex flex-col items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                           <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Pengeu un fitxer</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/json" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">o arrossegueu-lo aquí</p>
                                </div>
                                <p className="text-xs text-gray-500">Només fitxers JSON</p>
                            </div>
                        </div>

                         {file && (
                            <div className="mt-3 text-sm text-center">
                                <span className="font-medium">Fitxer seleccionat:</span> {file.name}
                            </div>
                        )}

                        <button
                            onClick={handleImport}
                            disabled={!file || isLoading}
                            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Important...' : "Importar Configuració"}
                        </button>
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Format JSON esperat</label>
                        <pre className="mt-1 text-xs bg-white p-3 rounded-md border overflow-x-auto">
                            <code>{exampleJson}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
