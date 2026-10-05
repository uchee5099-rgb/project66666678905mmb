const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken, requireAdmin);

// Dashboard Statistics
router.get('/stats', adminController.getAdminStats);

// User Management
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/confirm-activation', adminController.confirmUserActivation);

// Task Management
router.get('/tasks', adminController.getAdminTasks);
router.post('/tasks', adminController.createAdminTask);
router.put('/tasks/:id', adminController.updateAdminTask);
router.delete('/tasks/:id', adminController.deleteAdminTask);

// Submission Management
router.get('/submissions', adminController.getAdminSubmissions);
router.put('/submissions/:id', adminController.reviewSubmission);

// Withdrawal Management
router.get('/withdrawals', adminController.getAdminWithdrawals);
router.put('/withdrawals/:id', adminController.processWithdrawal);

// Platform Ledger
router.get('/transactions', adminController.getAdminTransactions);

// Audit Logs
router.get('/audit-logs', adminController.getAdminAuditLogs);

// System Settings
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);

module.exports = router;
