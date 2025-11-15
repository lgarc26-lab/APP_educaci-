
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Booking, Classroom, BlockedSlot, AppSettings, Role, BookingSeries, RecurrenceFrequency, ImportData } from '../types';
import { USERS, BOOKINGS, CLASSROOMS, BLOCKED_SLOTS, SETTINGS } from '../constants';
import { notificationService } from '../components/notificationService';

interface AppContextType {
    currentUser: User | null;
    login: (userId: string) => void;
    logout: () => void;
    users: User[];
    bookings: Booking[];
    classrooms: Classroom[];
    blockedSlots: BlockedSlot[];
    settings: AppSettings;
    addBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
    addRecurringBooking: (seriesData: Omit<BookingSeries, 'id' | 'teacherId'>) => Promise<void>;
    deleteBooking: (bookingId: string) => Promise<void>;
    deleteBookingSeries: (seriesId: string) => Promise<void>;
    isSlotAvailable: (classroomId: string, date: string, hour: number) => boolean;
    // Admin functions
    addClassroom: (classroom: Omit<Classroom, 'id'>) => Promise<void>;
    updateClassroom: (classroom: Classroom) => Promise<void>;
    deleteClassroom: (classroomId: string) => Promise<void>;
    addUser: (user: Omit<User, 'id'>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    importConfiguration: (data: ImportData) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(USERS);
    const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
    const [bookingSeries, setBookingSeries] = useState<BookingSeries[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>(CLASSROOMS);
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(BLOCKED_SLOTS);
    const [settings, setSettings] = useState<AppSettings>(SETTINGS);

    const login = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const isSlotAvailable = (classroomId: string, date: string, hour: number): boolean => {
        const dayOfWeek = new Date(date).getDay();
        
        const isBlocked = blockedSlots.some(
            slot => slot.classroomId === classroomId && slot.day === dayOfWeek && slot.hour === hour
        );
        if (isBlocked) return false;

        const isBooked = bookings.some(
            booking => booking.classroomId === classroomId && booking.date === date && booking.hour === hour
        );
        if (isBooked) return false;

        return true;
    };

    const addBooking = async (bookingData: Omit<Booking, 'id'>): Promise<void> => {
        if (!isSlotAvailable(bookingData.classroomId, bookingData.date, bookingData.hour)) {
            throw new Error("Aquesta aula no està disponible en aquesta franja horària.");
        }
        const newBooking: Booking = { ...bookingData, id: `res-${Date.now()}` };
        setBookings(prev => [...prev, newBooking]);

        const user = users.find(u => u.id === newBooking.teacherId);
        const classroom = classrooms.find(c => c.id === newBooking.classroomId);
        if (user && classroom) {
            notificationService.sendBookingConfirmation(newBooking, user, classroom);
        }
    };
    
    const addRecurringBooking = async (seriesData: Omit<BookingSeries, 'id' | 'teacherId'>) => {
        if (!currentUser) throw new Error("No s'ha trobat l'usuari.");
        
        const generatedDates: Date[] = [];
        const currentDate = new Date(seriesData.startDate + 'T00:00:00Z');
        const endDate = new Date(seriesData.endDate + 'T00:00:00Z');

        if (currentDate > endDate) {
            throw new Error("La data d'inici no pot ser posterior a la data de finalització.");
        }

        while (currentDate <= endDate) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) { // Dilluns a Divendres
                generatedDates.push(new Date(currentDate));
            }
            switch (seriesData.frequency) {
                case RecurrenceFrequency.DAILY:
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case RecurrenceFrequency.WEEKLY:
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case RecurrenceFrequency.MONTHLY:
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
        }

        const conflicts: string[] = [];
        for (const date of generatedDates) {
            if (!isSlotAvailable(seriesData.classroomId, date.toISOString().split('T')[0], seriesData.hour)) {
                conflicts.push(date.toLocaleDateString('ca-CA'));
            }
        }

        if (conflicts.length > 0) {
            throw new Error(`No s'ha pogut crear la reserva recurrent. Hi ha conflictes en les següents dates: ${conflicts.join(', ')}`);
        }

        const newSeries: BookingSeries = { ...seriesData, teacherId: currentUser.id, id: `series-${Date.now()}` };
        const newBookings: Booking[] = generatedDates.map(date => ({
            id: `res-${date.getTime()}-${Math.random()}`,
            seriesId: newSeries.id,
            classroomId: seriesData.classroomId,
            teacherId: currentUser.id,
            classGroup: seriesData.classGroup,
            subject: seriesData.subject,
            date: date.toISOString().split('T')[0],
            hour: seriesData.hour,
        }));
        
        setBookingSeries(prev => [...prev, newSeries]);
        setBookings(prev => [...prev, ...newBookings]);

        const classroom = classrooms.find(c => c.id === newSeries.classroomId);
        if (currentUser && classroom) {
            notificationService.sendRecurringBookingConfirmation(newSeries, currentUser, classroom);
        }
    };


    const deleteBooking = async (bookingId: string): Promise<void> => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        if (currentUser?.role === Role.ADMIN || (currentUser?.role === Role.TEACHER && booking.teacherId === currentUser.id)) {
            setBookings(prev => prev.filter(b => b.id !== bookingId));

            const user = users.find(u => u.id === booking.teacherId);
            const classroom = classrooms.find(c => c.id === booking.classroomId);
            if (user && classroom) {
                notificationService.sendBookingCancellation(booking, user, classroom);
            }
        } else {
            throw new Error("No teniu permisos per eliminar aquesta reserva.");
        }
    };

    const deleteBookingSeries = async (seriesId: string) => {
        const series = bookingSeries.find(s => s.id === seriesId);
        if (!series) return;

        if (currentUser?.role === Role.ADMIN || (currentUser?.role === Role.TEACHER && series.teacherId === currentUser.id)) {
            setBookings(prev => prev.filter(b => b.seriesId !== seriesId));
            setBookingSeries(prev => prev.filter(s => s.id !== seriesId));

            const user = users.find(u => u.id === series.teacherId);
            const classroom = classrooms.find(c => c.id === series.classroomId);
             if (user && classroom) {
                notificationService.sendSeriesCancellation(series, user, classroom);
            }
        } else {
             throw new Error("No teniu permisos per eliminar aquesta sèrie de reserves.");
        }
    };

    // Admin Functions
    const addClassroom = async (classroomData: Omit<Classroom, 'id'>) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");
        const newClassroom: Classroom = { ...classroomData, id: `aula-${Date.now()}` };
        setClassrooms(prev => [...prev, newClassroom]);
    };

    const updateClassroom = async (updatedClassroom: Classroom) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");
        setClassrooms(prev => prev.map(c => c.id === updatedClassroom.id ? updatedClassroom : c));
    };

    const deleteClassroom = async (classroomId: string) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");
        setClassrooms(prev => prev.filter(c => c.id !== classroomId));
        setBookings(prev => prev.filter(b => b.classroomId !== classroomId));
        setBlockedSlots(prev => prev.filter(bs => bs.classroomId !== classroomId));
        const seriesInClassroom = bookingSeries.filter(s => s.classroomId === classroomId);
        seriesInClassroom.forEach(s => deleteBookingSeries(s.id));
    };
    
    const addUser = async (userData: Omit<User, 'id'>) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");
        if (!userData.email.endsWith('@xtec.cat')) {
            throw new Error("L'alta al sistema s'ha de fer utilitzant un correu XTEC.");
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
    };

    const deleteUser = async (userId: string) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");
        setUsers(prev => prev.filter(u => u.id !== userId));
        setBookings(prev => prev.filter(b => b.teacherId !== userId));
        const seriesOfUser = bookingSeries.filter(s => s.teacherId === userId);
        seriesOfUser.forEach(s => deleteBookingSeries(s.id));
    };

    const importConfiguration = async (data: ImportData) => {
        if(currentUser?.role !== Role.ADMIN) throw new Error("Accés denegat.");

        // Import classrooms - Replace all
        if(data.classrooms) {
            const newClassrooms = data.classrooms.map(c => ({...c, id: `aula-${Date.now()}-${Math.random()}`}));
            setClassrooms(newClassrooms);
        }

        let updatedUsers = [...users];
        // Import users - Add only new ones
        if(data.users) {
            const existingEmails = new Set(users.map(u => u.email));
            const newUsers = data.users
                .filter(u => !existingEmails.has(u.email))
                .map(u => ({...u, id: `user-${Date.now()}-${Math.random()}`}));
            updatedUsers = [...users, ...newUsers];
            setUsers(updatedUsers);
        }

        // Import settings - Replace
        if(data.settings) {
            setSettings(prev => ({
                ...prev,
                schoolYear: data.settings?.schoolYear || prev.schoolYear,
                classGroups: data.settings?.classGroups || prev.classGroups,
                subjects: data.settings?.subjects || prev.subjects,
                teachers: updatedUsers.map(u => ({ id: u.id, name: u.name })),
            }));
        }

        // Clean up bookings and blocked slots from previous year
        setBookings([]);
        setBlockedSlots([]);
        setBookingSeries([]);
    };


    return (
        <AppContext.Provider value={{ currentUser, login, logout, users, bookings, classrooms, blockedSlots, settings, addBooking, addRecurringBooking, deleteBooking, deleteBookingSeries, isSlotAvailable, addClassroom, updateClassroom, deleteClassroom, addUser, deleteUser, importConfiguration }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AppProvider');
    }
    return context;
};
