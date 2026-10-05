const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { getOne } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'earnflow_super_secure_jwt_secret_key_2026_production';

// Optional authentication middleware for public endpoints
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await getOne('SELECT id, full_name, role FROM users WHERE id = $1', [decoded.userId]);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore invalid token on optional endpoints
    }
  }
  next();
}

router.get('/', optionalAuth, taskController.getTasks);
router.get('/:id', optionalAuth, taskController.getTaskById);
router.post('/:id/submit', authenticateToken, taskController.submitTask);

module.exports = router;
