
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AppContext';
import { WEEKDAYS, HOURS } from '../constants';
import { Booking, Role } from '../types';
import BookingModal from './BookingModal';
import { TrashIcon, RepeatIcon } from './Icons';

const CalendarView: React.FC = () => {
    const { classrooms, bookings, blockedSlots, currentUser, deleteBooking, deleteBookingSeries, settings } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClassroom, setSelectedClassroom] = useState<string>(classrooms[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ date: string, hour: number } | null>(null);
    const [error, setError] = useState('');
    const [filterTeacher, setFilterTeacher] = useState<string>('');
    const [filterGroup, setFilterGroup] = useState<string>('');
    const [filterSubject, setFilterSubject] = useState<string>('');

    const startOfWeek = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }, [currentDate]);

    const weekDates = useMemo(() => {
        return WEEKDAYS.map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [startOfWeek]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            if (booking.classroomId !== selectedClassroom) return false;
            if (filterTeacher && booking.teacherId !== filterTeacher) return false;
            if (filterGroup && booking.classGroup !== filterGroup) return false;
            if (filterSubject && booking.subject !== filterSubject) return false;
            return true;
        });
    }, [bookings, selectedClassroom, filterTeacher, filterGroup, filterSubject]);

    const bookingMap = useMemo(() => {
        const map = new Map<string, Booking>();
        for (const booking of filteredBookings) {
            const key = `${booking.date}-${booking.hour}`;
            map.set(key, booking);
        }
        return map;
    }, [filteredBookings]);
    
    const handleCellClick = (date: Date, hour: number) => {
        setModalData({ date: date.toISOString().split('T')[0], hour });
        setIsModalOpen(true);
    };
    
    const handleDeleteBooking = async (booking: Booking) => {
        if (booking.seriesId) {
            if (window.confirm("Aquesta reserva forma part d'una sèrie. Vols eliminar tota la sèrie de reserves?")) {
                try {
                    await deleteBookingSeries(booking.seriesId);
                } catch (err: any) {
                    setError(err.message);
                    setTimeout(() => setError(''), 3000);
                }
            } else if (window.confirm("O prefereixes eliminar només aquesta reserva individual?")) {
                 try {
                    await deleteBooking(booking.id);
                } catch (err: any) {
                    setError(err.message);
                    setTimeout(() => setError(''), 3000);
                }
            }
        } else {
            if (window.confirm('Estàs segur que vols eliminar aquesta reserva?')) {
                try {
                    await deleteBooking(booking.id);
                } catch (err: any) {
                    setError(err.message);
                    setTimeout(() => setError(''), 3000);
                }
            }
        }
    };

    const changeWeek = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + offset * 7);
            return newDate;
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            // Aquesta construcció evita problemes de zona horària
            const [year, month, day] = e.target.value.split('-').map(Number);
            setCurrentDate(new Date(year, month - 1, day));
        }
    };

    const getBookingForSlot = (date: Date, hour: number): Booking | undefined => {
        const key = `${date.toISOString().split('T')[0]}-${hour}`;
        return bookingMap.get(key);
    };

    const isSlotBlocked = (date: Date, hour: number): boolean => {
        const dayOfWeek = date.getDay();
        return blockedSlots.some(bs =>
            bs.classroomId === selectedClassroom &&
            bs.day === dayOfWeek &&
            bs.hour === hour
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <button onClick={() => changeWeek(-1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">&lt;</button>
                    <span className="text-lg font-semibold text-gray-700 text-center">
                       Setmana del {startOfWeek.toLocaleDateString('ca-CA', { day: 'numeric', month: 'long' })}
                    </span>
                    <button onClick={() => changeWeek(1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">&gt;</button>
                     <input
                        type="date"
                        value={currentDate.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        aria-label="Seleccionar data"
                    />
                </div>
                 <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
                    <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterTeacher}
                        onChange={(e) => setFilterTeacher(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tots els professors</option>
                        {settings.teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                     <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tots els grups</option>
                        {settings.classGroups.map(cg => (
                            <option key={cg} value={cg}>{cg}</option>
                        ))}
                    </select>
                     <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Totes les matèries</option>
                        {settings.subjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
            {error && <p className="text-red-500 text-center mb-2">{error}</p>}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="w-24 border p-2 text-sm font-medium text-gray-500 bg-gray-50">Hora</th>
                            {weekDates.map((date, i) => (
                                <th key={i} className="border p-2 text-sm font-medium text-gray-500 bg-gray-50">
                                    {WEEKDAYS[i]}<br/>
                                    <span className="font-normal text-xs">{date.toLocaleDateString('ca-CA', { day: '2-digit', month: '2-digit' })}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {HOURS.map(hour => (
                            <tr key={hour}>
                                <td className="border p-2 text-center text-sm text-gray-600 bg-gray-50">{hour}:00 - {hour+1}:00</td>
                                {weekDates.map((date, i) => {
                                    const booking = getBookingForSlot(date, hour);
                                    const blocked = isSlotBlocked(date, hour);
                                    const canDelete = currentUser?.role === Role.ADMIN || (currentUser && booking?.teacherId === currentUser.id);

                                    if (booking) {
                                        return (
                                            <td key={i} className="border p-1 text-xs text-center relative group bg-indigo-100">
                                                {booking.seriesId && (
                                                    <div className="absolute top-1 left-1 text-indigo-400" title="Reserva recurrent">
                                                        <RepeatIcon className="h-3 w-3" />
                                                    </div>
                                                )}
                                                <div className="font-bold text-indigo-800">{booking.subject}</div>
                                                <div className="text-indigo-700">{settings.teachers.find(t => t.id === booking.teacherId)?.name}</div>
                                                <div className="text-indigo-600">{booking.classGroup}</div>
                                                {canDelete && (
                                                    <button onClick={() => handleDeleteBooking(booking)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TrashIcon className="h-3 w-3"/>
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    }
                                    if (blocked) {
                                        const blockInfo = blockedSlots.find(bs => bs.classroomId === selectedClassroom && bs.day === date.getDay() && bs.hour === hour);
                                        return (
                                            <td key={i} className="border p-2 text-xs text-center bg-gray-200 text-gray-500">
                                                <div className="font-semibold">Bloquejat</div>
                                                <div>{blockInfo?.subject}</div>
                                                <div>{blockInfo?.classGroup}</div>
                                            </td>
                                        );
                                    }
                                    return (
                                        <td key={i} className="border p-2 text-center hover:bg-green-100 cursor-pointer transition-colors" onClick={() => handleCellClick(date, hour)}>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && modalData && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    classroomId={selectedClassroom}
                    date={modalData.date}
                    hour={modalData.hour}
                />
            )}
        </div>
    );
};

export default CalendarView;
