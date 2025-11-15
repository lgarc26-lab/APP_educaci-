
export enum Role {
    ADMIN = 'Administrador',
    TEACHER = 'Professor/a',
}

export interface User {
    id: string;
    name: string;
    email: string; // Ha de ser XTEC
    role: Role;
}

export interface Classroom {
    id: string;
    name: string;
    capacity: number;
    equipment: string[];
}

export interface BlockedSlot {
    id: string;
    classroomId: string;
    day: number; // 0 for Sunday, 1 for Monday, etc.
    hour: number; // 8, 9, 10, etc.
    subject: string;
    classGroup: string;
}

export enum RecurrenceFrequency {
    DAILY = 'Diària',
    WEEKLY = 'Setmanal',
    MONTHLY = 'Mensual',
}

export interface Booking {
    id: string;
    seriesId?: string; // ID de la sèrie recurrent
    classroomId: string;
    teacherId: string;
    classGroup: string;
    subject: string;
    date: string; // YYYY-MM-DD
    hour: number;
}

export interface BookingSeries {
    id: string;
    classroomId: string;
    teacherId: string;
    classGroup: string;
    subject: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    hour: number;
    frequency: RecurrenceFrequency;
}


export interface AppSettings {
    schoolYear: string;
    teachers: { id: string; name: string }[];
    classGroups: string[];
    subjects: string[];
}

export interface ImportData {
    classrooms?: Omit<Classroom, 'id'>[];
    users?: Omit<User, 'id'>[];
    settings?: {
        schoolYear?: string;
        classGroups?: string[];
        subjects?: string[];
    };
}
