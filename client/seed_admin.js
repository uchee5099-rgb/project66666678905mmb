const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function seedAdmin() {
  try {
    console.log('Connecting to DB...');
    const password = 'Uchman1472#';
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // Create admin 1
    await pool.query(`
      INSERT INTO users (full_name, email, phone, password_hash, referral_code, role, is_active, is_account_activated, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (email) DO UPDATE SET password_hash = $4, role = $6, is_active = true, is_account_activated = true
    `, ['Uchenna Administrator', 'uchennamister@gmail.com', '+2348012345678', hash, 'ADMIN2026', 'admin', true, true, now, now]);

    // Create admin 2
    await pool.query(`
      INSERT INTO users (full_name, email, phone, password_hash, referral_code, role, is_active, is_account_activated, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (email) DO UPDATE SET password_hash = $4, role = $6, is_active = true, is_account_activated = true
    `, ['System Admin', 'admin@earnflow.ng', '+2348000000000', hash, 'SYSADMIN', 'admin', true, true, now, now]);

    console.log('✅ Admin users created/updated:');
    console.log('1. uchennamister@gmail.com / Uchman1472#');
    console.log('2. admin@earnflow.ng / Uchman1472#');

    // Create wallet for admins if not exists
    const res = await pool.query("SELECT id FROM users WHERE email IN ('uchennamister@gmail.com','admin@earnflow.ng')");
    for (const user of res.rows) {
      await pool.query(`
        INSERT INTO wallets (user_id, available_balance, total_earned) 
        VALUES ($1, 50000, 50000) 
        ON CONFLICT DO NOTHING
      `, [user.id]);
    }

    console.log('✅ Wallets ensured');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();
