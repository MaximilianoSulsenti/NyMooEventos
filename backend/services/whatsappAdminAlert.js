// Aviso inmediato al admin de Nymoo cada vez que se genera un pedido nuevo
// en el checkout -- pensado para recuperar leads que abandonan antes de
// pagar, sin depender de estar mirando el panel de pedidos todo el día.
// Mismo mecanismo que whatsappReminder.js (Cloud API de Meta vía
// whatsappClient.js), pero con SU PROPIA plantilla aprobada aparte -- el
// contenido no tiene nada que ver con un recordatorio de tarea, así que no
// puede reusar "recordatorio_tarea".
//
// Variables de entorno (ninguna es obligatoria -- sin ellas queda simulada):
//   WHATSAPP_ADMIN_NUMBER        -- a qué número mandar la alerta. Default
//                                    543412654649 (el número de contacto de
//                                    Nymoo en la landing, ver LANDING_CONTACT
//                                    en frontend/src/utils/landingConfig.js --
//                                    OJO: sin el "9" de celular argentino, es
//                                    el formato exacto que Meta tiene
//                                    registrado como número de prueba
//                                    autorizado para esta app).
//   WHATSAPP_ADMIN_TEMPLATE_NAME -- nombre de la plantilla aprobada. Default
//                                    'hello_world', igual que
//                                    WHATSAPP_TEMPLATE_NAME en
//                                    whatsappReminder.js, para poder probar
//                                    la conexión antes de tener una propia.
//   WHATSAPP_ADMIN_TEMPLATE_LANG -- idioma de esa plantilla. Default 'en_US'.
const { sendWhatsappTemplate } = require('./whatsappClient');

const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || '543412654649';
const templateName = process.env.WHATSAPP_ADMIN_TEMPLATE_NAME || 'hello_world';
const templateLang = process.env.WHATSAPP_ADMIN_TEMPLATE_LANG || 'en_US';

function summarizeItems(order) {
  return order.items.map((item) => item.name).join(' + ');
}

function buildAlertMessage(order) {
  return [
    '🚨 ¡NYMOO ALERTA: NUEVA ORDEN GENERADA!',
    'Se ha registrado una nueva solicitud en el Checkout:',
    `- Pedido Número: ${order.orderNumber}`,
    `- Cliente: ${order.clientData.name} (${order.clientData.phone || 'sin teléfono'})`,
    `- Pack Elegido: ${summarizeItems(order)} (Monto: $${order.totalPrice.toLocaleString('es-AR')})`,
    '- Estado de Pago actual: Pendiente',
    '👉 Revisá el panel de control administrativo de Nymoo para verificar los datos de contacto y realizar el seguimiento comercial de este lead.',
  ].join('\n');
}

// 2 variables con NOMBRE (no numeradas {{1}}/{{2}}) -- Meta dejó de aceptar
// variables posicionadas al crear plantillas nuevas: ahora piden minúsculas
// + guion bajo (ej. {{pedido_cliente}}) y, además, ninguna variable puede
// quedar pegada al principio o al final del texto -- por eso el cuerpo
// sugerido para la plantilla arranca y termina con texto fijo:
//   Se registró una nueva orden: {{pedido_cliente}}
//   Detalle de la compra: {{detalle_compra}}
//   Estado: Pendiente. Revisá el panel de pedidos para hacer seguimiento.
// El nombre del parámetro acá (parameter_name) tiene que coincidir EXACTO
// con el que se usó al crear la plantilla en Meta.
function buildTemplateComponents(order) {
  if (templateName === 'hello_world') return [];

  const orderAndClient = `${order.orderNumber} — ${order.clientData.name} (${order.clientData.phone || 'sin teléfono'})`;
  const purchaseDetail = `${summarizeItems(order)} — $${order.totalPrice.toLocaleString('es-AR')}`;

  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', parameter_name: 'pedido_cliente', text: orderAndClient },
        { type: 'text', parameter_name: 'detalle_compra', text: purchaseDetail },
      ],
    },
  ];
}

// Pensada para llamarse "fire and forget" (sin await) apenas se guarda el
// pedido -- nunca debe frenar ni hacer fallar la respuesta del checkout al
// cliente. Por eso no tira excepciones: cualquier error queda solo logueado.
async function sendAdminOrderAlert(order) {
  const message = buildAlertMessage(order);

  try {
    const result = await sendWhatsappTemplate({
      to: adminNumber,
      templateName,
      templateLang,
      components: buildTemplateComponents(order),
    });

    if (result.simulated) {
      console.log(`[WhatsApp][SIMULADO] Alerta de pedido nuevo -> ${adminNumber}:\n${message}`);
      return { sent: true, simulated: true, message };
    }

    if (!result.sent) {
      console.error(
        `[WhatsApp] No se pudo mandar la alerta del pedido ${order.orderNumber} a ${adminNumber}:`,
        JSON.stringify(result.error)
      );
      return { sent: false, message, error: result.error };
    }

    console.log(
      `[WhatsApp] Alerta del pedido ${order.orderNumber} enviada a ${adminNumber} (id: ${result.response.messages?.[0]?.id || 'sin id'}).`
    );
    return { sent: true, message, response: result.response };
  } catch (err) {
    console.error(`[WhatsApp] Excepción al mandar la alerta del pedido ${order.orderNumber}:`, err.message);
    return { sent: false, message, error: err.message };
  }
}

module.exports = { sendAdminOrderAlert, buildAlertMessage };
