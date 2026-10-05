const { getOne, getAll } = require('../database/db');

/**
 * Get User Wallet Details
 * GET /api/wallet
 */
async function getWallet(req, res) {
  try {
    const userId = req.user.id;
    const wallet = await getOne('SELECT * FROM wallets WHERE user_id = $1', [userId]);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found.' });
    }

    res.json({
      wallet: {
        availableBalance: parseFloat(wallet.available_balance || 0),
        totalEarned: parseFloat(wallet.total_earned || 0),
        pendingRewards: parseFloat(wallet.pending_rewards || 0),
        referralRewards: parseFloat(wallet.referral_rewards || 0),
        totalWithdrawn: parseFloat(wallet.total_withdrawn || 0),
        updatedAt: wallet.updated_at
      }
    });
  } catch (err) {
    console.error('getWallet error:', err);
    res.status(500).json({ error: 'Failed to retrieve wallet information.' });
  }
}

/**
 * Get User Transaction Ledger
 * GET /api/transactions
 */
async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { type, status, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];

    if (type && type !== 'All') {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const transactions = await getAll(sql, params);
    const countRow = await getOne('SELECT COUNT(*) as total FROM transactions WHERE user_id = $1', [userId]);

    const formatted = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      description: tx.description,
      status: tx.status,
      reference: tx.reference,
      createdAt: tx.created_at
    }));

    res.json({
      transactions: formatted,
      totalCount: parseInt(countRow?.total || 0, 10)
    });
  } catch (err) {
    console.error('getTransactions error:', err);
    res.status(500).json({ error: 'Failed to retrieve transaction history.' });
  }
}

module.exports = {
  getWallet,
  getTransactions
};
