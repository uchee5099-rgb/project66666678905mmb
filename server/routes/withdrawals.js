const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, withdrawalController.requestWithdrawal);
router.get('/', authenticateToken, withdrawalController.getWithdrawals);

module.exports = router;
