
import { Booking, BookingSeries, User, Classroom } from '../types';

const sendEmail = (to: string, subject: string, body: string) => {
    console.log('--- SIMULACIÓ D\'ENVIAMENT DE CORREU ---');
    console.log(`Destinatari: ${to}`);
    console.log(`Assumpte: ${subject}`);
    console.log('Cos del missatge:');
    console.log(body);
    console.log('------------------------------------');
};

export const notificationService = {
    sendBookingConfirmation(booking: Booking, user: User, classroom: Classroom) {
        const subject = 'Confirmació de reserva d\'aula';
        const body = `
Hola ${user.name},

S'ha confirmat la teva reserva per a l'aula "${classroom.name}".

Detalls de la reserva:
- Matèria: ${booking.subject}
- Grup: ${booking.classGroup}
- Dia: ${new Date(booking.date  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Hora: ${booking.hour}:00 - ${booking.hour + 1}:00

Gràcies,
Gestor de Reserves d'Aules
        `;
        sendEmail(user.email, subject, body.trim());
    },

    sendRecurringBookingConfirmation(series: BookingSeries, user: User, classroom: Classroom) {
        const subject = 'Confirmació de reserva d\'aula recurrent';
        const body = `
Hola ${user.name},

S'ha confirmat la teva sèrie de reserves per a l'aula "${classroom.name}".

Detalls de la sèrie:
- Matèria: ${series.subject}
- Grup: ${series.classGroup}
- Des del: ${new Date(series.startDate  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Fins al: ${new Date(series.endDate  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Freqüència: ${series.frequency}
- Hora: ${series.hour}:00 - ${series.hour + 1}:00

Gràcies,
Gestor de Reserves d'Aules
        `;
        sendEmail(user.email, subject, body.trim());
    },

    sendBookingCancellation(booking: Booking, user: User, classroom: Classroom) {
        const subject = 'Cancel·lació de reserva d\'aula';
        const body = `
Hola ${user.name},

S'ha cancel·lat la teva reserva per a l'aula "${classroom.name}".

Detalls de la reserva cancel·lada:
- Matèria: ${booking.subject}
- Grup: ${booking.classGroup}
- Dia: ${new Date(booking.date  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Hora: ${booking.hour}:00 - ${booking.hour + 1}:00

Atentament,
Gestor de Reserves d'Aules
        `;
        sendEmail(user.email, subject, body.trim());
    },
    
    sendSeriesCancellation(series: BookingSeries, user: User, classroom: Classroom) {
        const subject = 'Cancel·lació de sèrie de reserves d\'aula';
        const body = `
Hola ${user.name},

S'ha cancel·lat la teva sèrie de reserves recurrents per a l'aula "${classroom.name}".

Detalls de la sèrie cancel·lada:
- Matèria: ${series.subject}
- Grup: ${series.classGroup}
- Des del: ${new Date(series.startDate  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Fins al: ${new Date(series.endDate  + 'T00:00:00Z').toLocaleDateString('ca-CA')}
- Freqüència: ${series.frequency}

Atentament,
Gestor de Reserves d'Aules
        `;
        sendEmail(user.email, subject, body.trim());
    }
};
