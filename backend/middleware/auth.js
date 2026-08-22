const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminSession = require('../models/AdminSession');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    req.user = user;
    // Mantiene viva la sesión mientras haya actividad real, para que el
    // lock de "un admin a la vez" no expire debajo de alguien que sigue
    // trabajando. Es best-effort: si falla no debe romper el request.
    AdminSession.updateOne(
      { key: 'lock', email: user.email.toLowerCase() },
      { lastActivity: new Date() }
    ).catch(() => {});
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = { requireAuth };
