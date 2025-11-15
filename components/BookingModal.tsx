
import React, { useState } from 'react';
import { useAuth } from '../context/AppContext';
import { RecurrenceFrequency } from '../types';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    classroomId: string;
    date: string;
    hour: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, classroomId, date, hour }) => {
    const { addBooking, addRecurringBooking, settings, currentUser, classrooms, isSlotAvailable } = useAuth();
    const [classGroup, setClassGroup] = useState<string>(settings.classGroups[0] || '');
    const [subject, setSubject] = useState<string>(settings.subjects[0] || '');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.WEEKLY);
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    if (!isOpen) return null;

    const classroomName = classrooms.find(c => c.id === classroomId)?.name || '';
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ca-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError('No s\'ha trobat l\'usuari. Si us plau, torneu a iniciar sessió.');
            return;
        }

        setIsLoading(true);
        setError('');

        if (isRecurring) {
            if (!endDate) {
                setError("Si us plau, especifiqueu una data de finalització per a la reserva recurrent.");
                setIsLoading(false);
                return;
            }
            try {
                await addRecurringBooking({
                    classroomId,
                    classGroup,
                    subject,
                    startDate: date,
                    endDate,
                    hour,
                    frequency,
                });
                onClose();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        } else {
             if (!isSlotAvailable(classroomId, date, hour)) {
                setError("Aquesta aula no està disponible en aquesta franja horària. Potser algú l'ha reservat mentre tenies la finestra oberta.");
                setIsLoading(false);
                return;
            }
            try {
                await addBooking({
                    classroomId,
                    teacherId: currentUser.id,
                    classGroup,
                    subject,
                    date,
                    hour,
                });
                onClose();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Nova Reserva</h2>
                <div className="mb-6 text-gray-600">
                    <p><span className="font-semibold">Aula:</span> {classroomName}</p>
                    <p><span className="font-semibold">Data:</span> {formattedDate}</p>
                    <p><span className="font-semibold">Hora:</span> {hour}:00 - {hour + 1}:00</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="classGroup" className="block text-sm font-medium text-gray-700">Grup Classe</label>
                            <select id="classGroup" value={classGroup} onChange={e => setClassGroup(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                {settings.classGroups.map(cg => <option key={cg} value={cg}>{cg}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Matèria</label>
                            <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                {settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Repetir aquesta reserva</span>
                        </label>
                    </div>

                    {isRecurring && (
                        <div className="mt-4 p-4 border rounded-md bg-gray-50 space-y-4">
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Freqüència</label>
                                <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as RecurrenceFrequency)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    {Object.values(RecurrenceFrequency).map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de finalització</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    min={date}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            Cancel·lar
                        </button>
                        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-indigo-300">
                            {isLoading ? 'Reservant...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
