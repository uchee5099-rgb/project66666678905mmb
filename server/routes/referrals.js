const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, referralController.getReferrals);

module.exports = router;
