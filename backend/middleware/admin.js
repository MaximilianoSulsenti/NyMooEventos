function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  return getAdminEmails().includes(email.toLowerCase());
}

function requireAdmin(req, res, next) {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ message: 'Solo el equipo de NyMoo puede hacer esto' });
  }
  next();
}

module.exports = { requireAdmin, isAdminEmail };
