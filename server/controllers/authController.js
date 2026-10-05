const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, getOne } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'earnflow_super_secure_jwt_secret_key_2026_production';

// Helper: generate unique referral code
function generateReferralCode(name) {
  const clean = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'FLOW';
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${clean}${rand}`;
}

/**
 * Register User
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { fullName, email, phone, password, confirmPassword, referralCode } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await getOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Check optional referral code
    let referrerId = null;
    if (referralCode && referralCode.trim()) {
      const referrer = await getOne('SELECT id, full_name FROM users WHERE referral_code = $1', [referralCode.trim().toUpperCase()]);
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let newRefCode = generateReferralCode(fullName);
    let codeExists = await getOne('SELECT id FROM users WHERE referral_code = $1', [newRefCode]);
    while (codeExists) {
      newRefCode = generateReferralCode(fullName);
      codeExists = await getOne('SELECT id FROM users WHERE referral_code = $1', [newRefCode]);
    }

    // Insert user
    await query(
      `INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'user', 'active')`,
      [fullName.trim(), cleanEmail, phone.trim(), passwordHash, newRefCode, referrerId]
    );

    const newUser = await getOne('SELECT id, full_name, email, phone, referral_code, role, status, created_at FROM users WHERE email = $1', [cleanEmail]);

    // Create wallet
    await query(
      `INSERT INTO wallets (user_id, available_balance, total_earned, pending_rewards, referral_rewards, total_withdrawn)
       VALUES ($1, 0.00, 0.00, 0.00, 0.00, 0.00)`,
      [newUser.id]
    );

    // Track referral if applicable
    if (referrerId) {
      const bonusAmount = parseFloat(process.env.REFERRAL_BONUS_AMOUNT || 250.00);
      await query(
        'INSERT INTO referrals (referrer_id, referred_id, reward_amount, status) VALUES ($1, $2, $3, $4)',
        [referrerId, newUser.id, bonusAmount, 'pending']
      );

      // Notify referrer
      await query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [
          referrerId,
          'New Referral Joined!',
          `${newUser.full_name} joined using your referral code. Complete eligibility to unlock your ₦${bonusAmount.toFixed(2)} bonus.`,
          'info'
        ]
      );
    }

    // Welcome Notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [
        newUser.id,
        'Welcome to EarnFlow!',
        'Your account is ready! Browse available tasks in the marketplace and begin earning rewards today.',
        'success'
      ]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        referralCode: newUser.referral_code,
        role: newUser.role,
        status: newUser.status,
        isActivated: false,
        activationStatus: 'unactivated',
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Login User
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getOne(
      'SELECT id, full_name, email, phone, password_hash, referral_code, role, status, avatar_url, is_activated, activation_status, activation_reference, activation_paid_at, activation_confirmed_at, created_at FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support@earnflow.ng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        isActivated: Boolean(user.is_activated),
        activationStatus: user.activation_status || 'unactivated',
        activationReference: user.activation_reference,
        activationPaidAt: user.activation_paid_at,
        activationConfirmedAt: user.activation_confirmed_at,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

/**
 * Get Current Authenticated User & Wallet
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const user = req.user;
    const wallet = await getOne('SELECT * FROM wallets WHERE user_id = $1', [user.id]);
    const unreadNotifs = await getOne('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = 0', [user.id]);

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
        isActivated: Boolean(user.is_activated),
        activationStatus: user.activation_status || 'unactivated',
        activationReference: user.activation_reference,
        activationPaidAt: user.activation_paid_at,
        activationConfirmedAt: user.activation_confirmed_at,
        createdAt: user.created_at
      },
      wallet: wallet ? {
        availableBalance: parseFloat(wallet.available_balance || 0),
        totalEarned: parseFloat(wallet.total_earned || 0),
        pendingRewards: parseFloat(wallet.pending_rewards || 0),
        referralRewards: parseFloat(wallet.referral_rewards || 0),
        totalWithdrawn: parseFloat(wallet.total_withdrawn || 0)
      } : {
        availableBalance: 0,
        totalEarned: 0,
        pendingRewards: 0,
        referralRewards: 0,
        totalWithdrawn: 0
      },
      unreadNotificationsCount: parseInt(unreadNotifs?.count || 0, 10)
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Internal server error fetching user.' });
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
async function logout(req, res) {
  res.json({ message: 'Logged out successfully.' });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
