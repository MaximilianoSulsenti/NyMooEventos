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
    // Número con formato internacional (ej. 5493416151235) al que el cron de
    // recordatorios le manda el aviso por WhatsApp -- ver
    // services/whatsappReminder.js. Opcional: una tarea sin teléfono cargado
    // simplemente no dispara recordatorio.
    clientPhone: { type: String, default: '', trim: true },
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
