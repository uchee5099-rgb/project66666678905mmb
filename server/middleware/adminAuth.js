function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Administrative privileges required.' });
  }
  next();
}

module.exports = { requireAdmin };
