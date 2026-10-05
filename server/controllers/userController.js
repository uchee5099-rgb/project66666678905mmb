const bcrypt = require('bcryptjs');
const { query, getOne, getAll } = require('../database/db');

/**
 * Get User Profile
 * GET /api/user/profile
 */
async function getProfile(req, res) {
  try {
    const user = await getOne(
      'SELECT id, full_name, email, phone, referral_code, role, status, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

/**
 * Update Profile
 * PUT /api/user/profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, phone, avatarUrl } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }

    await query(
      `UPDATE users
       SET full_name = $1, phone = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [fullName.trim(), phone.trim(), avatarUrl || null, userId]
    );

    const updated = await getOne('SELECT id, full_name, email, phone, referral_code, role, status, avatar_url FROM users WHERE id = $1', [userId]);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        fullName: updated.full_name,
        email: updated.email,
        phone: updated.phone,
        referralCode: updated.referral_code,
        role: updated.role,
        status: updated.status,
        avatarUrl: updated.avatar_url
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}

/**
 * Change Password
 * PUT /api/user/password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    const user = await getOne('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
}

/**
 * Get Notifications
 * GET /api/user/notifications
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await getAll(
      'SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY id DESC LIMIT 50',
      [userId]
    );

    res.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at
      }))
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
}

/**
 * Mark Notification Read
 * PUT /api/user/notifications/:id/read
 */
async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query('UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
}

/**
 * Mark All Notifications Read
 * PUT /api/user/notifications/read-all
 */
async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id;
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [userId]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
}

const paystackService = require('../services/paystackService');

/**
 * Initialize Paystack Account Activation Payment
 * POST /api/user/activate/initialize
 */
async function initializeActivation(req, res) {
  try {
    const user = await getOne('SELECT id, email, full_name, is_activated, activation_status FROM users WHERE id = $1', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.is_activated) {
      return res.status(400).json({ error: 'Your account is already activated.' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const callbackUrl = `${clientUrl}/withdraw?payment=complete`;

    const paystackData = await paystackService.initializeTransaction({
      email: user.email,
      amountInKobo: 100000, // ₦1,000.00
      callbackUrl,
      metadata: {
        userId: user.id,
        fullName: user.full_name,
        purpose: 'EarnFlow Account Activation'
      }
    });

    res.json({
      message: 'Paystack payment initialized successfully.',
      authorizationUrl: paystackData.authorizationUrl,
      accessCode: paystackData.accessCode,
      reference: paystackData.reference,
      amount: 1000.00,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_ec3ec80f29d09bebab36838824c6ad2e30dae836'
    });
  } catch (err) {
    console.error('initializeActivation error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize activation payment.' });
  }
}

/**
 * Verify Paystack Account Activation Payment
 * POST /api/user/activate/verify
 */
async function verifyActivation(req, res) {
  try {
    const userId = req.user.id;
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required.' });
    }

    // Verify with Paystack API using secret key
    const verification = await paystackService.verifyTransaction(reference);

    if (!verification.success) {
      return res.status(400).json({ error: 'Paystack payment was not successful.' });
    }

    if (verification.amount < 1000.00) {
      return res.status(400).json({ error: 'Payment amount received does not meet the ₦1,000 activation fee requirement.' });
    }

    // Update user record: status becomes pending_confirmation
    // User cannot withdraw until confirmed by admin
    await query(
      `UPDATE users
       SET activation_status = 'pending_confirmation',
           activation_reference = $1,
           activation_paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [reference, userId]
    );

    // Record transaction
    const existingTx = await getOne('SELECT id FROM transactions WHERE reference = $1', [reference]);
    if (!existingTx) {
      await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, reference)
         VALUES ($1, 'Activation Fee', 1000.00, 'Paystack Account Activation Fee', 'completed', $2)`,
        [userId, reference]
      );
    }

    // Notify user
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Activation Payment Verified', 'Your ₦1,000 activation fee has been received and verified via Paystack. Your account is now pending administrator confirmation to enable bank withdrawals.', 'info')`,
      [userId]
    );

    res.json({
      message: 'Activation payment verified successfully. Your account is awaiting administrative confirmation before withdrawals are enabled.',
      activationStatus: 'pending_confirmation',
      reference
    });
  } catch (err) {
    console.error('verifyActivation error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify activation payment.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  initializeActivation,
  verifyActivation
};
