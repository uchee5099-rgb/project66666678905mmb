const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found! You must run this inside Render Shell, not on your laptop.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
});

async function seedAdmin() {
  const hash = await bcrypt.hash('Uchman1472#', 10);
  const now = new Date().toISOString();
  console.log('Seeding admin...');
  
  await pool.query(`
    INSERT INTO users (full_name,email,password_hash,role,is_active,is_account_activated,referral_code,created_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
    ON CONFLICT (email) DO UPDATE SET password_hash=$3, role='admin', is_active=true, is_account_activated=true
  `, ['Uchenna Administrator','uchennamister@gmail.com',hash,'admin',true,true,'ADMIN2026',now]);

  await pool.query(`
    INSERT INTO users (full_name,email,password_hash,role,is_active,is_account_activated,referral_code,created_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
    ON CONFLICT (email) DO UPDATE SET password_hash=$3, role='admin', is_active=true, is_account_activated=true
  `, ['System Admin','admin@earnflow.ng',hash,'admin',true,true,'SYSADMIN',now]);

  console.log('✅ DONE - Admins ready:');
  console.log('uchennamister@gmail.com / Uchman1472#');
  console.log('admin@earnflow.ng / Uchman1472#');
  await pool.end();
  process.exit(0);
}
seedAdmin();
