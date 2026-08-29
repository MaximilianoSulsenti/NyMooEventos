const Task = require('../models/Task');

const TIME_FORMAT = /^([01]\d|2[0-3]):([0-5]\d)$/;
// "YYYY-MM-DD" tal cual sale de un <input type="date"> -- se valida como
// texto y se guarda como texto (ver models/Task.js), nunca se convierte a
// Date acá para no reintroducir el corrimiento de un día por huso horario.
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

function cleanPhone(value) {
  return String(value || '')
    .replace(/[^\d+]/g, '')
    .slice(0, 20);
}

// Valida y arma los campos para crear una tarea nueva -- separado de
// updateTask porque acá dueDate es obligatorio (una tarea siempre nace con
// fecha), mientras que en la edición cada campo es opcional (PATCH parcial).
function buildTaskInput(body) {
  const title = String(body?.title || '').trim();
  if (!title) return { error: 'El título es requerido' };

  const category = body?.category ? String(body.category).trim() : 'Otros';
  if (!Task.CATEGORIES.includes(category)) {
    return { error: 'Categoría inválida' };
  }

  const dueDate = String(body?.dueDate || '').trim();
  if (!DATE_FORMAT.test(dueDate)) {
    return { error: 'La fecha es requerida' };
  }

  const dueTime = String(body?.dueTime || '').trim();
  if (dueTime && !TIME_FORMAT.test(dueTime)) {
    return { error: 'La hora debe tener formato HH:MM' };
  }

  return {
    input: {
      title: title.slice(0, 150),
      category,
      dueDate,
      dueTime,
      clientPhone: cleanPhone(body?.clientPhone),
      notes: String(body?.notes || '').trim().slice(0, 500),
    },
  };
}

async function fetchTasks(eventId) {
  return Task.find({ eventId }).sort({ dueDate: 1, dueTime: 1 });
}

// Tanto el dueño del evento (requireEventOwnership) como el link de cliente
// (requireClientToken) dejan la tarea en req.event -- por eso las cuatro
// acciones de abajo no necesitan una versión "ForClient" separada como
// tables/playlist: alcanza con gatear por activeModules.smartAgenda antes
// de delegar en la misma función.
async function listTasks(req, res) {
  res.json(await fetchTasks(req.event._id));
}

// A diferencia de listTasks (admin, que ya tiene eventName/activeModules de
// una llamada aparte a GET /events/:eventId -- ver Dashboard.jsx), el modo
// cliente no tiene ese otro llamado autenticado disponible, así que acá se
// devuelve todo junto en una sola respuesta gateada por token, mismo
// criterio que getTablesForClient/getPlaylistForClient.
async function listTasksForClient(req, res) {
  if (!req.event.activeModules.smartAgenda) {
    return res.status(403).json({ message: 'La agenda inteligente no está activa para este evento' });
  }
  const tasks = await fetchTasks(req.event._id);
  // event.date se usa en el front para calcular las fechas de tareas
  // recurrentes y de las plantillas por tipo de evento (ver
  // agendaTemplates.js) -- ej. "pagar seña 120 días antes" necesita saber
  // cuándo es el evento.
  res.json({ eventName: req.event.eventName, activeModules: req.event.activeModules, date: req.event.date, tasks });
}

async function createTask(req, res) {
  const { input, error } = buildTaskInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const task = await Task.create({ ...input, eventId: req.event._id });
  res.status(201).json(task);
}

async function createTaskForClient(req, res) {
  if (!req.event.activeModules.smartAgenda) {
    return res.status(403).json({ message: 'La agenda inteligente no está activa para este evento' });
  }
  return createTask(req, res);
}

async function updateTask(req, res) {
  const { taskId } = req.params;
  const task = await Task.findOne({ _id: taskId, eventId: req.event._id });
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  const { title, category, dueDate, dueTime, clientPhone, notes, status } = req.body;

  if (status !== undefined) {
    if (!Task.STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    task.status = status;
  }
  if (title !== undefined) {
    const trimmed = String(title).trim();
    if (!trimmed) return res.status(400).json({ message: 'El título es requerido' });
    task.title = trimmed.slice(0, 150);
  }
  if (category !== undefined) {
    if (!Task.CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Categoría inválida' });
    }
    task.category = category;
  }
  if (dueDate !== undefined) {
    const trimmed = String(dueDate).trim();
    if (!DATE_FORMAT.test(trimmed)) return res.status(400).json({ message: 'Fecha inválida' });
    task.dueDate = trimmed;
  }
  if (dueTime !== undefined) {
    const trimmed = String(dueTime).trim();
    if (trimmed && !TIME_FORMAT.test(trimmed)) {
      return res.status(400).json({ message: 'La hora debe tener formato HH:MM' });
    }
    task.dueTime = trimmed;
  }
  if (clientPhone !== undefined) task.clientPhone = cleanPhone(clientPhone);
  if (notes !== undefined) task.notes = String(notes).trim().slice(0, 500);

  // Si se toca la fecha, la hora o el teléfono -- lo que determina CUÁNDO y
  // A QUIÉN sale el recordatorio -- se resetea reminderSent. Sin esto, mover
  // una tarea ya vencida (con reminderSent=true) a una fecha futura haría
  // que el cron nunca vuelva a avisar, porque para el sistema "ya se mandó".
  if (dueDate !== undefined || dueTime !== undefined || clientPhone !== undefined) {
    task.reminderSent = false;
  }

  await task.save();
  res.json(task);
}

async function updateTaskForClient(req, res) {
  if (!req.event.activeModules.smartAgenda) {
    return res.status(403).json({ message: 'La agenda inteligente no está activa para este evento' });
  }
  return updateTask(req, res);
}

async function deleteTask(req, res) {
  const { taskId } = req.params;
  const task = await Task.findOneAndDelete({ _id: taskId, eventId: req.event._id });
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json({ message: 'Tarea eliminada' });
}

async function deleteTaskForClient(req, res) {
  if (!req.event.activeModules.smartAgenda) {
    return res.status(403).json({ message: 'La agenda inteligente no está activa para este evento' });
  }
  return deleteTask(req, res);
}

module.exports = {
  listTasks,
  listTasksForClient,
  createTask,
  createTaskForClient,
  updateTask,
  updateTaskForClient,
  deleteTask,
  deleteTaskForClient,
};
