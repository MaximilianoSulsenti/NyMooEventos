const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminSession = require('../models/AdminSession');
const { isAdminEmail } = require('../middleware/admin');

// Cuánto tiempo sin actividad se considera que una sesión quedó "abandonada"
// (pestaña cerrada sin cerrar sesión, corte de luz, etc) y libera el lock
// para que el otro admin pueda entrar sin tener que esperar a que alguien
// cierre sesión a mano.
const SESSION_IDLE_MS = 30 * 60 * 1000;

function issueToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: isAdminEmail(user.email),
  };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email y password son requeridos' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  // Plataforma privada: solo se puede crear cuenta con un email que el
  // administrador ya haya agregado a ADMIN_EMAILS. Cerrar el acceso público
  // reutiliza esa misma lista en vez de sumar un mecanismo nuevo.
  if (!isAdminEmail(email)) {
    return res.status(403).json({ message: 'El registro está cerrado. Contactá al administrador para que te habilite.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = issueToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email y password son requeridos' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Un solo admin conectado a la vez: si hay otra sesión activa (con
  // actividad reciente) y es de un email distinto, no dejamos entrar para
  // que los dos no terminen editando el mismo evento al mismo tiempo.
  const activeSession = await AdminSession.findOne({ key: 'lock' });
  if (
    activeSession &&
    activeSession.email !== user.email.toLowerCase() &&
    Date.now() - activeSession.lastActivity.getTime() < SESSION_IDLE_MS
  ) {
    return res.status(409).json({
      message: `Hay una sesión activa de ${activeSession.name || activeSession.email}. Esperá a que cierre sesión o quede inactiva unos minutos.`,
    });
  }

  await AdminSession.findOneAndUpdate(
    { key: 'lock' },
    { email: user.email.toLowerCase(), name: user.name, lastActivity: new Date() },
    { upsert: true }
  );

  const token = issueToken(user);
  res.json({ token, user: sanitizeUser(user) });
}

async function logout(req, res) {
  await AdminSession.deleteOne({ key: 'lock', email: req.user.email.toLowerCase() });
  res.json({ message: 'Sesión cerrada' });
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { register, login, logout, me };
