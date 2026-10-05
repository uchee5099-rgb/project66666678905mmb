const crypto = require('crypto');
const { query, getOne, getAll } = require('../database/db');

/**
 * Request a Bank Withdrawal
 * POST /api/withdrawals
 */
async function requestWithdrawal(req, res) {
  try {
    const userId = req.user.id;

    // 0. Account Activation Check:
    // If user account activation is not confirmed by admin, generate error "account not activated"
    const user = await getOne('SELECT is_activated, activation_status FROM users WHERE id = $1', [userId]);
    if (!user || !user.is_activated) {
      return res.status(403).json({ error: 'account not activated' });
    }

    const { amount, bankName, accountNumber, accountName } = req.body;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid withdrawal amount greater than zero.' });
    }

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'Please provide complete bank account details.' });
    }

    // Account number validation (Nigerian NUBAN standard is 10 digits)
    const cleanAccountNum = accountNumber.toString().replace(/\D/g, '');
    if (cleanAccountNum.length !== 10) {
      return res.status(400).json({ error: 'Invalid account number. Nigerian bank accounts must be exactly 10 digits.' });
    }

    // Check minimum withdrawal setting
    const minSetting = await getOne("SELECT value FROM system_settings WHERE key = 'min_withdrawal'");
    const minWithdrawal = parseFloat(minSetting?.value || process.env.MIN_WITHDRAWAL_AMOUNT || 1000.00);

    if (withdrawAmount < minWithdrawal) {
      return res.status(400).json({
        error: `Requested amount (₦${withdrawAmount.toFixed(2)}) is below the minimum withdrawal threshold of ₦${minWithdrawal.toFixed(2)}.`
      });
    }

    // Fetch user wallet
    const wallet = await getOne('SELECT available_balance FROM wallets WHERE user_id = $1', [userId]);
    const available = parseFloat(wallet?.available_balance || 0);

    if (withdrawAmount > available) {
      return res.status(400).json({
        error: `Insufficient available funds. Your available balance is ₦${available.toFixed(2)}.`
      });
    }

    const txRef = `WD-EF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // 1. Deduct amount from available balance
    await query(
      'UPDATE wallets SET available_balance = available_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [withdrawAmount, userId]
    );

    // 2. Insert withdrawal record
    await query(
      `INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [userId, withdrawAmount, bankName.trim(), cleanAccountNum, accountName.trim()]
    );

    // 3. Insert transaction record (pending)
    await query(
      `INSERT INTO transactions (user_id, type, amount, description, status, reference)
       VALUES ($1, 'Withdrawal', $2, $3, 'pending', $4)`,
      [userId, -withdrawAmount, `Withdrawal to ${bankName} (${cleanAccountNum})`, txRef]
    );

    // 4. Create user notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [
        userId,
        'Withdrawal Request Submitted',
        `Your request to withdraw ₦${withdrawAmount.toFixed(2)} to ${bankName} (${cleanAccountNum}) has been submitted for administrative compliance review.`,
        'info'
      ]
    );

    res.status(201).json({
      message: 'Withdrawal request submitted successfully.',
      withdrawal: {
        amount: withdrawAmount,
        bankName,
        accountNumber: cleanAccountNum,
        accountName,
        status: 'pending',
        reference: txRef
      }
    });
  } catch (err) {
    console.error('requestWithdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
}

/**
 * Get User Withdrawal History
 * GET /api/withdrawals
 */
async function getWithdrawals(req, res) {
  try {
    const userId = req.user.id;
    const withdrawals = await getAll(
      'SELECT id, amount, bank_name, account_number, account_name, status, admin_notes, created_at, updated_at FROM withdrawals WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    const minSetting = await getOne("SELECT value FROM system_settings WHERE key = 'min_withdrawal'");
    const minWithdrawal = parseFloat(minSetting?.value || process.env.MIN_WITHDRAWAL_AMOUNT || 1000.00);

    const formatted = withdrawals.map(w => ({
      id: w.id,
      amount: parseFloat(w.amount),
      bankName: w.bank_name,
      accountNumber: w.account_number,
      accountName: w.account_name,
      status: w.status,
      adminNotes: w.admin_notes,
      createdAt: w.created_at,
      updatedAt: w.updated_at
    }));

    res.json({
      withdrawals: formatted,
      minWithdrawal
    });
  } catch (err) {
    console.error('getWithdrawals error:', err);
    res.status(500).json({ error: 'Failed to retrieve withdrawals.' });
  }
}

module.exports = {
  requestWithdrawal,
  getWithdrawals
};
