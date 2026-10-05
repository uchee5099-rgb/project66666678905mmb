const jwt = require('jsonwebtoken');
const { getOne } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'earnflow_super_secure_jwt_secret_key_2026_production';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getOne(
      'SELECT id, full_name, email, phone, referral_code, role, status, avatar_url, is_activated, activation_status, activation_reference, activation_paid_at, activation_confirmed_at, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User no longer exists.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Please contact EarnFlow support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
  }
}

module.exports = { authenticateToken };
