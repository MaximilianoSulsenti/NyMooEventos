const cron = require('node-cron');
const Task = require('../models/Task');
const { sendWhatsappReminder } = require('../services/whatsappReminder');

// Nymoo es un producto para el mercado argentino (ver LANDING_CONTACT en el
// front) y Argentina está en UTC-3 fijo, sin horario de verano desde 2009 --
// así que alcanza con un offset constante, sin necesidad de sumar una
// librería de zonas horarias solo para esto.
const AR_UTC_OFFSET_HOURS = 3;

// dueDate/dueTime se guardan como texto plano ("YYYY-MM-DD"/"HH:MM", ver
// Task.js) pensado en hora de Argentina -- se arma el instante UTC a mano
// sumando el offset, en vez de dejar que `new Date(...)` lo interprete con
// la zona horaria del proceso (que en producción corre en UTC, no en
// Argentina, y para un string de solo fecha además lo tomaría como
// medianoche UTC por regla del spec de JS -- la causa del bug original de
// "se guarda un día antes").
function resolveDueAtUTC(task) {
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const [hour, minute] = (task.dueTime || '00:00').split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, (hour || 0) + AR_UTC_OFFSET_HOURS, minute || 0));
}

// Recorre TODAS las tareas pendientes con recordatorio sin enviar y filtra
// en memoria las que ya vencieron -- no se puede filtrar por fecha a nivel
// de Mongo porque dueDate es texto, no un Date indexable por rango, pero la
// cantidad de tareas en juego (por evento, y en total) es chica, así que no
// hace falta más que esto. Corre cada hora, así que no hace falta más
// precisión que esa.
async function runReminderSweep() {
  const now = new Date();
  const candidates = await Task.find({ status: 'Pendiente', reminderSent: false }).populate('eventId', 'eventName');

  let resolvedCount = 0;
  let retryCount = 0;

  for (const task of candidates) {
    if (resolveDueAtUTC(task) > now) continue;

    // eslint-disable-next-line no-await-in-loop
    const result = await sendWhatsappReminder(task, task.eventId?.eventName);

    if (result.retry) {
      // Falló pero es reintentable (plantilla todavía sin aprobar, token
      // vencido, error de red) -- se deja reminderSent en false a propósito
      // para que la próxima corrida del cron lo reintente sola, sin que
      // nadie tenga que tocar la tarea a mano.
      retryCount += 1;
      continue;
    }

    task.reminderSent = true;
    // eslint-disable-next-line no-await-in-loop
    await task.save();
    resolvedCount += 1;
  }

  if (resolvedCount > 0 || retryCount > 0) {
    console.log(`[ReminderCron] ${resolvedCount} recordatorio(s) resuelto(s), ${retryCount} para reintentar en la próxima corrida.`);
  }

  return resolvedCount;
}

function startReminderCron() {
  // Antes corría en punto cada hora -- una tarea programada para "dentro de
  // unos minutos" podía tardar hasta 59 minutos en salir, porque el barrido
  // anterior ya había pasado. Cada 10 minutos sigue siendo un chequeo
  // liviano (una sola consulta a Mongo) pero baja esa espera máxima a 10.
  cron.schedule('*/10 * * * *', () => {
    runReminderSweep().catch((err) => console.error('[ReminderCron] Error en el barrido de recordatorios:', err.message));
  });
  console.log('[ReminderCron] Programado para correr cada 10 minutos.');
}

module.exports = { startReminderCron, runReminderSweep };
