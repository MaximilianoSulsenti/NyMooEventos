// Normaliza el WhatsApp que tipea un invitado a lo único que de verdad abre
// un chat en wa.me para un celular argentino: "549" + los 10 dígitos
// (código de área + número), sin importar si escribió el +54, el 9 de
// WhatsApp, o nada de eso -- solo el número "limpio".
//
// Alcance a propósito acotado: cubre "11 1234-5678" y "+54 9 11 1234-5678"
// (las dos formas más comunes al tipear en el celular), pero NO el viejo
// formato de discado doméstico con "0" + código de área + "15" intercalado
// antes del número (ej. "011 15-1234-5678") -- ahí el "15" no está al
// principio del string sino después del código de área, que tiene largo
// variable según la zona, así que no hay forma simple y confiable de
// sacarlo sin una tabla de prefijos. Es un campo opcional y de mejor
// esfuerzo (el invitado puede revisar su propio número antes de guardar),
// no vale la complejidad de resolver ese caso acá.
//
// OJO -- a propósito NO se reusa normalizeArgentinePhone de
// services/whatsappClient.js: esa función hace lo CONTRARIO (le SACA el 9)
// porque la API de Meta para plantillas lo pide sin el 9. Un link wa.me sin
// el 9 simplemente no abre el chat en un celular argentino -- mismo dígito,
// comportamiento opuesto según a quién se lo mandás.
function normalizeWhatsapp(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('54')) digits = digits.slice(2);
  if (digits.startsWith('9')) digits = digits.slice(1);

  if (digits.length < 10) return '';

  return `549${digits.slice(-10)}`;
}

function buildWaLink(normalizedDigits, text) {
  return `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(text)}`;
}

module.exports = { normalizeWhatsapp, buildWaLink };
