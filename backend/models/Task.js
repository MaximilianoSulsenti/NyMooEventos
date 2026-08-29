const mongoose = require('mongoose');

const TASK_CATEGORIES = ['Cita/Reunión', 'Pago/Presupuesto', 'Proveedor', 'Otros'];
const TASK_STATUSES = ['Pendiente', 'Completada'];

// Colección propia (no un subdocumento de Event, a diferencia de
// tables/playlistTracks) porque una tarea tiene entidad propia: se crea,
// edita y borra una por una desde el calendario, no se reemplaza la lista
// entera de una -- mismo criterio que Guest.js.
const taskSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    // Teléfono al que el cron de recordatorios le manda el aviso por
    // WhatsApp -- ver services/whatsappReminder.js (normaliza el formato
    // solo, no hace falta cargarlo de una forma exacta). Opcional: una
    // tarea sin teléfono cargado simplemente no dispara recordatorio. No
    // tiene por qué ser el teléfono de quien organiza -- cualquiera que
    // esté ayudando (una hermana, una prima) puede recibir el recordatorio
    // de una tarea puntual si se carga su número acá.
    clientPhone: { type: String, default: '', trim: true },
    // Nombre de a quién le llega ESE recordatorio puntual -- solo para
    // mostrarlo en la lista/el modal (ver TaskListPanel.jsx/TaskModal.jsx),
    // no se usa para nada del envío en sí. Opcional.
    clientName: { type: String, default: '', trim: true, maxlength: 60 },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: TASK_CATEGORIES, default: 'Otros' },
    // Texto plano "YYYY-MM-DD" a propósito, NO Date -- un objeto Date es un
    // instante absoluto (con zona horaria), y `new Date("YYYY-MM-DD")` lo
    // interpreta como medianoche UTC por regla del spec de JS. Para un
    // usuario en Argentina (UTC-3) eso hacía que la tarea apareciera un día
    // antes del que había elegido, apenas se convertía de vuelta a hora
    // local para mostrarla en el calendario. Guardándolo como string se
    // evita esa conversión de zona horaria en toda la cadena -- mismo
    // criterio que dueTime, que ya era string por la misma razón.
    dueDate: { type: String, required: true, trim: true },
    dueTime: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    status: { type: String, enum: TASK_STATUSES, default: 'Pendiente' },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// El cron (jobs/reminderCron.js) corre este filtro cada hora -- índice para
// que el barrido sea instantáneo aunque la colección crezca con muchos
// eventos activos a la vez.
taskSchema.index({ status: 1, reminderSent: 1 });

taskSchema.statics.CATEGORIES = TASK_CATEGORIES;
taskSchema.statics.STATUSES = TASK_STATUSES;

module.exports = mongoose.model('Task', taskSchema);
