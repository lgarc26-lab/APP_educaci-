
import { Role, User, Classroom, BlockedSlot, Booking, AppSettings } from './types';

export const USERS: User[] = [
    { id: 'user-1', name: 'Carme Lluís', email: 'clluis@xtec.cat', role: Role.ADMIN },
    { id: 'user-2', name: 'Jordi Pons', email: 'jpons@xtec.cat', role: Role.TEACHER },
    { id: 'user-3', name: 'Marta Puig', email: 'mpuig@xtec.cat', role: Role.TEACHER },
];

export const CLASSROOMS: Classroom[] = [
    { id: 'aula-1', name: 'Aula de Teoria 1', capacity: 30, equipment: ['Pissarra digital', 'Projector'] },
    { id: 'aula-2', name: 'Laboratori de Ciències', capacity: 24, equipment: ['Projector', 'Aixetes', 'Material de laboratori'] },
    { id: 'aula-3', name: 'Aula d\'Informàtica', capacity: 25, equipment: ['Ordinadors', 'Pissarra digital'] },
    { id: 'aula-4', name: 'Taller de Tecnologia', capacity: 20, equipment: ['Eines', 'Bancs de treball'] },
];

export const BLOCKED_SLOTS: BlockedSlot[] = [
    { id: 'block-1', classroomId: 'aula-3', day: 1, hour: 10, subject: 'Informàtica', classGroup: '4t ESO A' },
    { id: 'block-2', classroomId: 'aula-3', day: 1, hour: 11, subject: 'Informàtica', classGroup: '4t ESO A' },
    { id: 'block-3', classroomId: 'aula-2', day: 3, hour: 8, subject: 'Química', classGroup: '1r Batx A' },
    { id: 'block-4', classroomId: 'aula-2', day: 3, hour: 9, subject: 'Química', classGroup: '1r Batx A' },
];

export const BOOKINGS: Booking[] = [
    { id: 'res-1', classroomId: 'aula-1', teacherId: 'user-2', classGroup: '1r ESO B', subject: 'Matemàtiques', date: getTodayPlusDays(0), hour: 12 },
    { id: 'res-2', classroomId: 'aula-4', teacherId: 'user-3', classGroup: '2n ESO C', subject: 'Tecnologia', date: getTodayPlusDays(1), hour: 9 },
];

export const SETTINGS: AppSettings = {
    schoolYear: '2023-2024',
    teachers: USERS.map(u => ({ id: u.id, name: u.name })),
    classGroups: ['1r ESO A', '1r ESO B', '2n ESO A', '2n ESO C', '3r ESO B', '4t ESO A', '1r Batx A'],
    subjects: ['Matemàtiques', 'Llengua Catalana', 'Tecnologia', 'Química', 'Física', 'Informàtica', 'Ciències Socials'],
};

export const WEEKDAYS = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres'];
export const HOURS = [8, 9, 10, 11, 12, 13, 15, 16, 17]; // Horari escolar

// Helper to get dates relative to today for mock data
function getTodayPlusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
