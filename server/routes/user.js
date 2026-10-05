const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/password', authenticateToken, userController.changePassword);
router.get('/notifications', authenticateToken, userController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, userController.markNotificationRead);
router.put('/notifications/read-all', authenticateToken, userController.markAllNotificationsRead);

// Paystack Account Activation
router.post('/activate/initialize', authenticateToken, userController.initializeActivation);
router.post('/activate/verify', authenticateToken, userController.verifyActivation);

module.exports = router;
