const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

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

// Wedding Match: a diferencia de los demás módulos, acá CASI todo el
// tráfico de un invitado ya tiene un identificador propio (el token de su
// perfil) antes de que importe limitarlo -- usar ese token como clave en
// vez de la IP evita que un salón entero (una sola IP de wifi para 100+
// celus) comparta un balde único entre todos los invitados reales.
function byTokenOrIp(req) {
  const token = req.header('x-match-token');
  return token || ipKeyGenerator(req);
}

// Sin token todavía (recién escaneó el QR, está creando su perfil) -- acá
// sí hay que limitar por IP, generoso para que decenas de invitados puedan
// registrarse desde la misma wifi del salón en la misma ventana de tiempo.
const matchOnboardingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, probá de nuevo en unos minutos' },
});

// Lecturas (feed, grilla, mis matches, etc.) -- ya hay token, así que se
// limita por invitado real, no por IP compartida del salón.
const matchReadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  keyGenerator: byTokenOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, probá de nuevo en unos minutos' },
});

// Like/pass -- más permisivo que una lectura porque el swipe genera una
// request por tarjeta, pero igual acotado: el mazo tiene como mucho un
// par de cientos de perfiles, así que nadie real necesita más que esto.
const matchActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 400,
  keyGenerator: byTokenOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, probá de nuevo en unos minutos' },
});

module.exports = {
  authLimiter,
  publicWriteLimiter,
  publicLookupLimiter,
  matchOnboardingLimiter,
  matchReadLimiter,
  matchActionLimiter,
};
