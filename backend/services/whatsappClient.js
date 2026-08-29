// Cliente compartido de la Cloud API de WhatsApp Business (Meta) -- usado
// tanto por whatsappReminder.js (recordatorios de tareas al cliente) como
// por whatsappAdminAlert.js (aviso de pedido nuevo al admin). Centraliza acá
// la parte que es igual para cualquier mensaje: credenciales, la llamada
// HTTP a la API, y devolver un resultado en un formato uniforme -- cada
// caller arma su propio mensaje/plantilla y decide qué hacer con el
// resultado (loguear distinto, reintentar o no, etc.).
const WHATSAPP_API_VERSION = 'v21.0';

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

const whatsappReady = Boolean(accessToken && phoneNumberId);

// Normaliza cualquier forma en que alguien pueda cargar un celular argentino
// (con o sin +54, con o sin espacios/guiones, con o sin el "9" de celular)
// al único formato que confirmamos -- probando en la vida real, no por
// documentación -- que matchea la lista de destinatarios autorizados de
// Meta en Modo Desarrollo: "54" + código de área + número, SIN el "9" (la
// API igual lo enruta bien -- Meta lo resuelve al wa_id "549..." solita).
// Sin esto, cargar el número "como se dice" (ej. 3416151235, sin 54) manda
// bien la plantilla pero Meta lo rechaza con "Recipient phone number not in
// allowed list" aunque el número SÍ esté agregado como autorizado, porque
// compara el string tal cual se lo mandamos contra el que tiene registrado.
function normalizeArgentinePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('54')) digits = digits.slice(2);
  if (digits.startsWith('9') && digits.length === 11) digits = digits.slice(1);
  return digits ? `54${digits}` : '';
}

// Manda un mensaje de plantilla -- obligatorio para cualquier mensaje que el
// negocio inicia (no es una respuesta dentro de una ventana de conversación
// de 24hs), que es siempre el caso acá. Sin credenciales configuradas,
// devuelve simulated:true sin intentar la llamada real.
async function sendWhatsappTemplate({ to, templateName, templateLang, components = [] }) {
  if (!whatsappReady) {
    return { sent: false, retry: false, simulated: true };
  }

  const cleanTo = normalizeArgentinePhone(to);

  try {
    const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'template',
        template: { name: templateName, language: { code: templateLang }, components },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // retry:true -- puede ser la plantilla sin aprobar, un token vencido,
      // un error pasajero de Meta. Queda a criterio de quien llama si tiene
      // sentido reintentar (el cron de recordatorios sí lo hace; una alerta
      // de pedido nuevo no tiene reintento automático, ese caller puede
      // ignorar el flag).
      return { sent: false, retry: true, error: data, to: cleanTo };
    }

    return { sent: true, retry: false, response: data, to: cleanTo };
  } catch (err) {
    return { sent: false, retry: true, error: err.message, to: cleanTo };
  }
}

module.exports = { sendWhatsappTemplate, whatsappReady };
