// Envío de recordatorios por WhatsApp vía la Cloud API de Meta (ver
// whatsappClient.js para la parte compartida con whatsappAdminAlert.js) --
// mismo criterio que orderController.js con Mercado Pago: si no hay
// credenciales configuradas, cae a un log simulado en vez de fallar, así el
// resto del flujo (cron, modelo) funciona igual en cualquier entorno.
//
// Variables de entorno que necesita (ninguna es obligatoria -- sin ellas
// sigue en modo simulado):
//   WHATSAPP_ACCESS_TOKEN    -- token de acceso (temporal de 24hs para
//                                probar, o permanente de un System User
//                                para producción) -- compartido con
//                                whatsappAdminAlert.js, ver whatsappClient.js.
//   WHATSAPP_PHONE_NUMBER_ID -- el "Phone number ID" del panel de Meta
//                                (NO es el número de teléfono en sí) --
//                                también compartido.
//   WHATSAPP_TEMPLATE_NAME   -- nombre de la plantilla aprobada a usar para
//                                recordatorios. Default 'hello_world' (la
//                                plantilla de prueba que Meta aprueba sola)
//                                para poder probar la conexión el mismo día,
//                                antes de tener la plantilla propia aprobada.
//   WHATSAPP_TEMPLATE_LANG   -- código de idioma de esa plantilla. Default
//                                'en_US' (el de hello_world). Cuando se
//                                cambie a la plantilla propia en español,
//                                actualizar también este valor (ej. 'es' o
//                                'es_AR', el que se haya elegido al crearla).
const { sendWhatsappTemplate, whatsappReady } = require('./whatsappClient');

const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'hello_world';
const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';

if (whatsappReady) {
  console.log(`[WhatsApp] Cloud API configurada -- recordatorios usando plantilla "${templateName}" (${templateLang}).`);
} else {
  console.log('[WhatsApp] Sin credenciales configuradas -- los recordatorios quedan en modo simulado.');
}

// dueDate es texto plano "YYYY-MM-DD" (ver models/Task.js) -- se arma el
// label a mano en vez de pasarlo por `new Date(...).toLocaleDateString()`,
// que interpreta un string de solo fecha como medianoche UTC y puede
// mostrar el día anterior según la zona horaria del proceso.
function buildReminderMessage(task, eventName) {
  const [year, month, day] = task.dueDate.split('-');
  const dateLabel = `${day}/${month}/${year}`;
  const timeLabel = task.dueTime ? ` a las ${task.dueTime}` : '';
  const notesLabel = task.notes ? `\nNota: ${task.notes}` : '';
  const greeting = task.clientName ? `Hola ${task.clientName} -- ` : '';
  return `🔔 Recordatorio de Nymoo -- ${eventName}\n${greeting}"${task.title}"${timeLabel} (${dateLabel}).${notesLabel}`;
}

// Arma los "components" del template message -- hello_world no lleva
// variables, así que se manda sin components. La plantilla propia (una vez
// aprobada) usa solo 2 variables -- Meta rechaza plantillas con muchas
// variables en poco texto fijo (y variables pegadas sin nada en el medio,
// tipo {{3}}{{4}}), así que acá el saludo con el nombre (si lo cargaron --
// ver clientName en models/Task.js, para cuando el recordatorio va a otra
// persona ayudando a organizar, no al dueño del evento), título+fecha+hora
// y la nota (si tiene) se combinan en UN solo texto para {{1}}, dejando
// {{2}} para el nombre del evento. Esto no toca la plantilla en sí (misma
// estructura aprobada por Meta, sin re-revisión) -- solo cambia el valor
// que se manda en esa variable en cada envío, igual que ya varía el título
// de la tarea. Body aprobado:
//   Tenés pendiente: *{{1}}*
//   Evento: {{2}}
//
//   No te olvides -- ¡así llegás a tiempo con todo listo!
function buildTemplateComponents(task, eventName) {
  if (templateName === 'hello_world') return [];

  const [year, month, day] = task.dueDate.split('-');
  const dateLabel = `${day}/${month}/${year}`;
  const timeLabel = task.dueTime ? ` a las ${task.dueTime}` : '';
  const notesLabel = task.notes ? ` — Nota: ${task.notes}` : '';
  const greeting = task.clientName ? `Hola ${task.clientName} — ` : '';
  const taskLabel = `${greeting}${task.title} (${dateLabel}${timeLabel})${notesLabel}`;

  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: taskLabel },
        { type: 'text', text: eventName },
      ],
    },
  ];
}

async function sendWhatsappReminder(task, eventName) {
  const resolvedEventName = eventName || 'tu evento';
  const message = buildReminderMessage(task, resolvedEventName);

  if (!task.clientPhone) {
    console.log(`[WhatsApp][SIMULADO] Tarea "${task.title}" (${task._id}) no tiene teléfono cargado, no se envía.`);
    // retry:false -- no hay nada que reintentar sin teléfono; si más
    // adelante se le carga uno, updateTask ya resetea reminderSent solo.
    return { sent: false, retry: false, message };
  }

  const result = await sendWhatsappTemplate({
    to: task.clientPhone,
    templateName,
    templateLang,
    components: buildTemplateComponents(task, resolvedEventName),
  });

  if (result.simulated) {
    console.log(`[WhatsApp][SIMULADO] -> ${task.clientPhone}: ${message}`);
    return { sent: true, retry: false, message, simulated: true };
  }

  if (!result.sent) {
    console.error(`[WhatsApp] Meta rechazó el envío a ${result.to}:`, JSON.stringify(result.error));
    // retry:true -- puede ser la plantilla todavía sin aprobar, un token
    // vencido, etc. Se deja reminderSent en false para que el cron lo
    // vuelva a intentar en la próxima corrida en vez de darlo por perdido.
    return { sent: false, retry: true, message, error: result.error };
  }

  console.log(`[WhatsApp] Enviado a ${result.to} (id: ${result.response.messages?.[0]?.id || 'sin id'}).`);
  return { sent: true, retry: false, message, response: result.response };
}

module.exports = { sendWhatsappReminder, buildReminderMessage };
