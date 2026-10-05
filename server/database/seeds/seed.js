/**
 * EarnFlow Seed Script
 * Populates database with production-ready realistic demonstration data
 * Supports both PostgreSQL and SQLite
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { initDb, query, getOne, getAll } = require('../db');

async function runSeed() {
  console.log('--- Starting EarnFlow Database Seeding ---');
  await initDb();

  // 1. Password Hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const userPasswordHash = await bcrypt.hash('UserPass123!', salt);

  console.log('✓ Password hashes generated.');

  // 2. System Settings
  const settings = [
    { key: 'min_withdrawal', value: '1000.00', description: 'Minimum withdrawal amount in NGN (₦)' },
    { key: 'referral_bonus', value: '250.00', description: 'Reward bonus for successful referral in NGN (₦)' },
    { key: 'platform_name', value: 'EarnFlow', description: 'Public brand name' },
    { key: 'support_email', value: 'support@earnflow.ng', description: 'Customer support email' },
    { key: 'demo_mode', value: 'true', description: 'Demonstration disclaimer banner active' }
  ];

  for (const s of settings) {
    const existing = await getOne('SELECT key FROM system_settings WHERE key = $1', [s.key]);
    if (!existing) {
      await query(
        'INSERT INTO system_settings (key, value, description) VALUES ($1, $2, $3)',
        [s.key, s.value, s.description]
      );
    }
  }
  console.log('✓ System settings verified.');

  // 3. Seed Users
  // Admin
  let admin = await getOne('SELECT id FROM users WHERE email = $1', ['admin@earnflow.ng']);
  if (!admin) {
    await query(
      `INSERT INTO users (full_name, email, phone, password_hash, referral_code, role, status, is_activated, activation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 'activated')`,
      ['EarnFlow Administrator', 'admin@earnflow.ng', '+2348012345678', adminPasswordHash, 'ADMIN001', 'admin', 'active']
    );
    admin = await getOne('SELECT id FROM users WHERE email = $1', ['admin@earnflow.ng']);
  } else {
    await query("UPDATE users SET is_activated = 1, activation_status = 'activated' WHERE id = $1", [admin.id]);
  }

  // Admin Users table record
  const adminUserRecord = await getOne('SELECT id FROM admin_users WHERE user_id = $1', [admin.id]);
  if (!adminUserRecord) {
    await query(
      'INSERT INTO admin_users (user_id, role, permissions, last_login) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
      [admin.id, 'superadmin', 'all']
    );
  }

  // Chidi Okonkwo (Primary Demo User - Activated)
  let chidi = await getOne('SELECT id FROM users WHERE email = $1', ['chidi@earnflow.ng']);
  if (!chidi) {
    await query(
      `INSERT INTO users (full_name, email, phone, password_hash, referral_code, role, status, is_activated, activation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 'activated')`,
      ['Chidi Okonkwo', 'chidi@earnflow.ng', '+2348023456789', userPasswordHash, 'CHIDI88', 'user', 'active']
    );
    chidi = await getOne('SELECT id FROM users WHERE email = $1', ['chidi@earnflow.ng']);
  } else {
    await query("UPDATE users SET is_activated = 1, activation_status = 'activated' WHERE id = $1", [chidi.id]);
  }

  // Amaka Eze (Referred by Chidi - Unactivated Demo User)
  let amaka = await getOne('SELECT id FROM users WHERE email = $1', ['amaka@earnflow.ng']);
  if (!amaka) {
    await query(
      `INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by, role, status, is_activated, activation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'unactivated')`,
      ['Amaka Eze', 'amaka@earnflow.ng', '+2348034567890', userPasswordHash, 'AMAKA21', chidi.id, 'user', 'active']
    );
    amaka = await getOne('SELECT id FROM users WHERE email = $1', ['amaka@earnflow.ng']);
  }

  console.log('✓ Seed users verified (Admin, Chidi [Activated], Amaka [Unactivated]).');

  // 4. Seed Wallets
  if (admin) {
    const adminWallet = await getOne('SELECT id FROM wallets WHERE user_id = $1', [admin.id]);
    if (!adminWallet) {
      await query('INSERT INTO wallets (user_id, available_balance, total_earned) VALUES ($1, $2, $3)', [admin.id, 0.00, 0.00]);
    }
  }

  if (chidi) {
    const chidiWallet = await getOne('SELECT id FROM wallets WHERE user_id = $1', [chidi.id]);
    if (!chidiWallet) {
      await query(
        `INSERT INTO wallets (user_id, available_balance, total_earned, pending_rewards, referral_rewards, total_withdrawn)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [chidi.id, 3500.00, 6000.00, 1050.00, 500.00, 2500.00]
      );
    } else {
      await query(
        `UPDATE wallets SET available_balance = 3500.00, total_earned = 6000.00, pending_rewards = 1050.00 WHERE user_id = $1`,
        [chidi.id]
      );
    }
  }

  if (amaka) {
    const amakaWallet = await getOne('SELECT id FROM wallets WHERE user_id = $1', [amaka.id]);
    if (!amakaWallet) {
      await query(
        `INSERT INTO wallets (user_id, available_balance, total_earned, pending_rewards, referral_rewards, total_withdrawn)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [amaka.id, 850.00, 850.00, 600.00, 0.00, 0.00]
      );
    } else {
      await query(
        `UPDATE wallets SET available_balance = 850.00, total_earned = 850.00, pending_rewards = 600.00 WHERE user_id = $1`,
        [amaka.id]
      );
    }
  }
  console.log('✓ Wallets verified.');

  // 5. Seed Referrals Link
  if (chidi && amaka) {
    const existingRef = await getOne('SELECT id FROM referrals WHERE referrer_id = $1 AND referred_id = $2', [chidi.id, amaka.id]);
    if (!existingRef) {
      await query(
        'INSERT INTO referrals (referrer_id, referred_id, reward_amount, status) VALUES ($1, $2, $3, $4)',
        [chidi.id, amaka.id, 250.00, 'completed']
      );
    }
  }

  // 6. Seed Tasks
  const demoTasks = [
    {
      title: 'Fintech Usability & Mobile Banking Survey',
      category: 'Surveys',
      reward_amount: 350.00,
      estimated_minutes: 5,
      description: 'Share your honest feedback about everyday mobile banking experiences in Nigeria to help improve fintech products.',
      instructions: '1. Click Start Task to review questionnaire.\n2. Answer all 8 questions thoughtfully.\n3. Paste your feedback summary and submission token.\n4. Submit for review.',
      requirements: 'Must have active Nigerian bank account experience (OPay, Kuda, PalmPay, GTBank, Zenith, etc.).',
      proof_type: 'text',
      max_participants: 1500,
      status: 'active'
    },
    {
      title: 'Test PalmPay Virtual Card Feature Flow',
      category: 'Apps',
      reward_amount: 600.00,
      estimated_minutes: 10,
      description: 'Test the onboarding process and navigation of the PalmPay virtual card feature and report your user experience.',
      instructions: '1. Open the PalmPay mobile application.\n2. Navigate to Finance -> Cards.\n3. Take a screenshot showing the card setup screen.\n4. Describe one feature that was easy to use and one improvement area.',
      requirements: 'Must submit valid screenshot and two sentences of structured feedback.',
      proof_type: 'text_or_screenshot',
      max_participants: 500,
      status: 'active'
    },
    {
      title: 'Follow & Repost EarnFlow on X (Twitter)',
      category: 'Social',
      reward_amount: 200.00,
      estimated_minutes: 3,
      description: 'Support our community growth by following our official account and reposting our pinned announcement.',
      instructions: '1. Visit @EarnFlowHQ on X.\n2. Follow the handle.\n3. Like and repost the pinned tweet.\n4. Submit your handle and link to your repost.',
      requirements: 'Account must have at least 15 real followers and be older than 30 days.',
      proof_type: 'text',
      max_participants: 3000,
      status: 'active'
    },
    {
      title: 'Write Honest Review for Kuda MFB on Play Store',
      category: 'Reviews',
      reward_amount: 500.00,
      estimated_minutes: 7,
      description: 'Submit an informative review of Kuda Bank on Google Play Store or Apple App Store.',
      instructions: '1. Open the store and search Kuda.\n2. Rate and write a genuine review of at least 25 words.\n3. Take a screenshot showing your published review with username.\n4. Submit screenshot link or review excerpt.',
      requirements: 'Review must be unique and authentic. Plagiarized text will be rejected.',
      proof_type: 'text_or_screenshot',
      max_participants: 800,
      status: 'active'
    },
    {
      title: 'Nigerian Online Shopping Experience Feedback',
      category: 'Surveys',
      reward_amount: 450.00,
      estimated_minutes: 6,
      description: 'Provide consumer feedback regarding local e-commerce stores, delivery speeds, and customer support.',
      instructions: '1. Complete our 6-minute consumer questionnaire.\n2. Rate payment methods and delivery reliability.\n3. Submit your completion summary below.',
      requirements: 'Must have purchased online in Nigeria within the last 3 months.',
      proof_type: 'text',
      max_participants: 1200,
      status: 'active'
    },
    {
      title: 'Join Official EarnFlow Telegram Announcement Channel',
      category: 'Social',
      reward_amount: 150.00,
      estimated_minutes: 2,
      description: 'Join our official Telegram community to stay updated on high-value daily task drops and platform updates.',
      instructions: '1. Click our official Telegram invite.\n2. Join the channel.\n3. Submit your Telegram handle (@yourname) for verification.',
      requirements: 'Must stay in the channel to receive reward credit.',
      proof_type: 'text',
      max_participants: 5000,
      status: 'active'
    },
    {
      title: 'Share EarnFlow Referral Link on WhatsApp Status',
      category: 'Social',
      reward_amount: 250.00,
      estimated_minutes: 4,
      description: 'Post your personal EarnFlow referral flyer and link on your WhatsApp status for at least 6 hours.',
      instructions: '1. Copy your referral link from Referrals page.\n2. Post on your WhatsApp status with a short caption.\n3. Take a screenshot after 6 hours showing viewers count.\n4. Submit screenshot.',
      requirements: 'Minimum 25 status viewers.',
      proof_type: 'text_or_screenshot',
      max_participants: 1000,
      status: 'active'
    },
    {
      title: 'Quick 2-Minute Broadband Internet Speed Test',
      category: 'Other',
      reward_amount: 300.00,
      estimated_minutes: 4,
      description: 'Test your mobile or home fiber speed (MTN, Airtel, Glo, Starlink) and report connection speeds.',
      instructions: '1. Run speed test on fast.com or speedtest.net.\n2. Note your download speed, ISP, and state.\n3. Submit the result link and text details.',
      requirements: 'Must include ISP name, city/state, and verified speed.',
      proof_type: 'text',
      max_participants: 2000,
      status: 'active'
    }
  ];

  for (const t of demoTasks) {
    const existing = await getOne('SELECT id FROM tasks WHERE title = $1', [t.title]);
    if (!existing) {
      await query(
        `INSERT INTO tasks (title, category, reward_amount, estimated_minutes, description, instructions, requirements, proof_type, max_participants, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [t.title, t.category, t.reward_amount, t.estimated_minutes, t.description, t.instructions, t.requirements, t.proof_type, t.max_participants, t.status]
      );
    }
  }
  console.log('✓ Demo tasks verified (8 diverse tasks across categories).');

  // 7. Seed Sample Submissions
  const allTasks = await getAll('SELECT id, title, reward_amount FROM tasks');
  if (chidi && allTasks.length > 0) {
    // Approved submission
    const existingSub1 = await getOne('SELECT id FROM task_submissions WHERE user_id = $1 AND task_id = $2', [chidi.id, allTasks[0].id]);
    if (!existingSub1) {
      await query(
        `INSERT INTO task_submissions (task_id, user_id, proof_content, status, admin_notes, submitted_at, reviewed_at, reviewed_by)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6)`,
        [allTasks[0].id, chidi.id, 'Survey completed. Token: FIN-TECH-NG-8842. Answered all questions regarding Kuda & Opay app speed.', 'approved', 'Verified valid survey token. Reward credited.', admin.id]
      );
    }

    // Pending submission
    if (allTasks.length > 1) {
      const existingSub2 = await getOne('SELECT id FROM task_submissions WHERE user_id = $1 AND task_id = $2', [chidi.id, allTasks[1].id]);
      if (!existingSub2) {
        await query(
          `INSERT INTO task_submissions (task_id, user_id, proof_content, status, submitted_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [allTasks[1].id, chidi.id, 'Navigated to PalmPay virtual card. Onboarding took 1 minute. UI was clear and smooth.', 'pending']
        );
      }
    }
  }

  if (amaka && allTasks.length > 2) {
    const existingSub3 = await getOne('SELECT id FROM task_submissions WHERE user_id = $1 AND task_id = $2', [amaka.id, allTasks[2].id]);
    if (!existingSub3) {
      await query(
        `INSERT INTO task_submissions (task_id, user_id, proof_content, status, submitted_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [allTasks[2].id, amaka.id, 'Followed @EarnFlowHQ on X. Handle: @amaka_tech_ng. Retweeted pinned post.', 'pending']
      );
    }
  }

  // 8. Seed Sample Transactions
  if (chidi) {
    const existingTx = await getOne('SELECT id FROM transactions WHERE user_id = $1', [chidi.id]);
    if (!existingTx) {
      await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, reference) VALUES
         ($1, 'Task Reward', 350.00, 'Reward for completing: Fintech Usability Survey', 'completed', 'TX-EF-1001'),
         ($1, 'Referral Reward', 250.00, 'Bonus for inviting Amaka Eze (AMAKA21)', 'completed', 'TX-EF-1002'),
         ($1, 'Withdrawal', -2500.00, 'Withdrawal to GTBank (0123456789)', 'completed', 'TX-EF-1003')`,
        [chidi.id]
      );
    }
  }

  // 9. Seed Sample Withdrawal
  if (chidi) {
    const existingWd = await getOne('SELECT id FROM withdrawals WHERE user_id = $1', [chidi.id]);
    if (!existingWd) {
      await query(
        `INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name, status, admin_notes) VALUES
         ($1, 2500.00, 'Guaranty Trust Bank (GTBank)', '0123456789', 'Chidi Okonkwo', 'completed', 'Disbursed via NIBSS transfer reference #GT-99214')`,
        [chidi.id]
      );
    }
  }

  // 10. Sample Notifications
  if (chidi) {
    const existingNotif = await getOne('SELECT id FROM notifications WHERE user_id = $1', [chidi.id]);
    if (!existingNotif) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
         ($1, 'Welcome to EarnFlow!', 'Your account has been registered. Explore available tasks and start earning rewards.', 'info', 1),
         ($1, 'Task Approved!', 'Your submission for Fintech Usability Survey was approved. ₦350.00 has been credited to your balance.', 'success', 0),
         ($1, 'Referral Bonus Received', 'Your friend Amaka Eze registered using your referral code. You earned ₦250.00!', 'success', 0)`,
        [chidi.id]
      );
    }
  }

  console.log('--- EarnFlow Database Seeding Completed Successfully ---');
}

if (require.main === module) {
  runSeed().then(() => {
    console.log('Seed process finished.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed process error:', err);
    process.exit(1);
  });
}

module.exports = { runSeed };
