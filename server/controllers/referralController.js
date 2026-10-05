const { getOne, getAll } = require('../database/db');

/**
 * Get User Referral Data & History
 * GET /api/referrals
 */
async function getReferrals(req, res) {
  try {
    const userId = req.user.id;
    const user = req.user;

    const wallet = await getOne('SELECT referral_rewards FROM wallets WHERE user_id = $1', [userId]);
    const referralBonus = parseFloat(wallet?.referral_rewards || 0);

    // List of referred users
    const referrals = await getAll(
      `SELECT r.id, r.reward_amount, r.status, r.created_at,
              u.full_name as referred_name, u.created_at as joined_date
       FROM referrals r
       JOIN users u ON r.referred_id = u.id
       WHERE r.referrer_id = $1
       ORDER BY r.id DESC`,
      [userId]
    );

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'completed').length;

    const formattedList = referrals.map(r => ({
      id: r.id,
      name: r.referred_name,
      joinedDate: r.joined_date,
      status: r.status,
      rewardAmount: parseFloat(r.reward_amount)
    }));

    res.json({
      referralCode: user.referral_code,
      stats: {
        totalReferrals,
        successfulReferrals,
        referralRewards: referralBonus
      },
      referrals: formattedList
    });
  } catch (err) {
    console.error('getReferrals error:', err);
    res.status(500).json({ error: 'Failed to retrieve referral data.' });
  }
}

module.exports = {
  getReferrals
};
