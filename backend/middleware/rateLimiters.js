const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, probá de nuevo en unos minutos' },
});

const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, probá de nuevo en unos minutos' },
});

// Para lecturas públicas sensibles a fuerza bruta (ej. buscar invitado por
// nombre o código): más permisivo que el de escritura porque una persona
// real puede tipear mal su nombre varias veces, pero igual limita el
// intento de "probar nombres al voleo" para colarse en la lista.
const publicLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, probá de nuevo en unos minutos' },
});

module.exports = { authLimiter, publicWriteLimiter, publicLookupLimiter };
