
'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');

let dbClient = null;
let dbType = null;
let initPromise = null;

const DB_FILE = path.join(__dirname, 'earnflow.sqlite');
const MEMORY_BACKUP_FILE = path.join(__dirname, 'earnflow_data.json');
const MIGRATION_FILE = path.join(
  __dirname,
  'migrations',
  '001_initial_schema.sql'
);

const isProduction = () => process.env.NODE_ENV === 'production';

function convertPostgresPlaceholders(sql) {
  let index = 0;

  // Convert SQLite-style question marks to PostgreSQL placeholders.
  // Do not convert question marks inside quoted strings.
  let output = '';
  let quote = null;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (quote) {
      output += char;

      if (char === quote) {
        if (sql[i + 1] === quote) {
          output += sql[++i];
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      output += char;
    } else if (char === '?') {
      output += `$${++index}`;
    } else {
      output += char;
    }
  }

  return output;
}

function convertSqlitePlaceholders(sql, params) {
  const mappedParams = [];

  // Convert PostgreSQL $1, $2, etc. into SQLite question marks.
  const convertedSql = sql.replace(/\$(\d+)/g, (match, number) => {
    mappedParams.push(params[Number(number) - 1]);
    return '?';
  });

  return {
    sql: convertedSql,
    params: mappedParams.length ? mappedParams : params
  };
}

async function runPgMigrations() {
  const migrationFiles = [
    MIGRATION_FILE,
    path.join(
      __dirname,
      'migrations',
      '002_repair_users_status.sql'
    )
  ];

  for (const file of migrationFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required migration file is missing: ${file}`);
    }

    const sql = fs.readFileSync(file, 'utf8');

    if (!sql.trim()) {
      throw new Error(`Migration file is empty: ${file}`);
    }

    await dbClient.query(sql);
    console.log(`Migration completed: ${path.basename(file)}`);
  }
}

async function runSqliteMigrations() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active','suspended')),
      avatar_url TEXT,
      is_activated INTEGER DEFAULT 0,
      activation_status TEXT DEFAULT 'unactivated',
      activation_reference TEXT,
      activation_paid_at TEXT,
      activation_confirmed_at TEXT,
      activation_confirmed_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      available_balance NUMERIC NOT NULL DEFAULT 0 CHECK(available_balance >= 0),
      total_earned NUMERIC NOT NULL DEFAULT 0 CHECK(total_earned >= 0),
      pending_rewards NUMERIC NOT NULL DEFAULT 0 CHECK(pending_rewards >= 0),
      referral_rewards NUMERIC NOT NULL DEFAULT 0 CHECK(referral_rewards >= 0),
      total_withdrawn NUMERIC NOT NULL DEFAULT 0 CHECK(total_withdrawn >= 0),
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      reward_amount NUMERIC NOT NULL CHECK(reward_amount > 0),
      estimated_minutes INTEGER DEFAULT 5,
      description TEXT NOT NULL,
      instructions TEXT NOT NULL,
      requirements TEXT NOT NULL,
      proof_type TEXT DEFAULT 'text_or_screenshot',
      max_participants INTEGER DEFAULT 1000,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS task_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      proof_content TEXT NOT NULL,
      proof_image_url TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      reference TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL CHECK(amount > 0),
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reward_amount NUMERIC NOT NULL DEFAULT 250,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(referrer_id, referred_id)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'superadmin',
      permissions TEXT DEFAULT 'all',
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const statement of statements) {
    await dbClient.query(statement);
  }

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)',
    'CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON task_submissions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id)'
  ];

  for (const statement of indexes) {
    await dbClient.query(statement);
  }

  console.log('SQLite schema initialized.');
}

async function initializePostgres() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required when PostgreSQL is enabled.'
    );
  }

  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
    ...(process.env.PGSSLMODE === 'require'
      ? { ssl: { rejectUnauthorized: false } }
      : {})
  });

  try {
    await pool.query('SELECT 1');
    dbClient = pool;
    dbType = 'postgres';

    await runPgMigrations();

    console.log('PostgreSQL connection established.');
    return dbType;
  } catch (error) {
    dbClient = null;
    dbType = null;
    await pool.end().catch(() => {});
    throw error;
  }
}

async function initializeSqlite() {
  const sqlite3 = require('sqlite3').verbose();

  const rawDb = await new Promise((resolve, reject) => {
    const database = new sqlite3.Database(DB_FILE, error => {
      if (error) return reject(error);
      resolve(database);
    });
  });

  await new Promise((resolve, reject) => {
    rawDb.run('PRAGMA foreign_keys = ON', error => {
      if (error) return reject(error);
      resolve();
    });
  });

  dbClient = {
    _raw: rawDb,

    query(sql, params = []) {
      const converted = convertSqlitePlaceholders(sql, params);
      const finalSql = converted.sql.replace(
        /TIMESTAMP WITH TIME ZONE/gi,
        'TEXT'
      );

      return new Promise((resolve, reject) => {
        if (/^\s*(SELECT|PRAGMA|WITH|EXPLAIN)\b/i.test(finalSql)) {
          rawDb.all(finalSql, converted.params, (error, rows) => {
            if (error) return reject(error);
            resolve({
              rows: rows || [],
              rowCount: (rows || []).length
            });
          });
        } else {
          rawDb.run(finalSql, converted.params, function (error) {
            if (error) return reject(error);
            resolve({
              rows: [],
              rowCount: this.changes || 0,
              lastID: this.lastID
            });
          });
        }
      });
    }
  };

  dbType = 'sqlite';
  await runSqliteMigrations();

  console.log('SQLite database initialized:', DB_FILE);
  return dbType;
}

async function initDb() {
  if (dbClient) return dbType;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const usePostgres =
      isProduction() ||
      process.env.USE_POSTGRES_FIRST === 'true' ||
      Boolean(process.env.DATABASE_URL);

    if (usePostgres) {
      try {
        return await initializePostgres();
      } catch (error) {
        console.error(
          'PostgreSQL initialization failed:',
          error.message
        );

        // Never fall back to a different database in production.
        if (isProduction()) throw error;

        if (process.env.USE_POSTGRES_FIRST === 'true') {
          console.warn('Trying SQLite for local development.');
        } else {
          throw error;
        }
      }
    }

    if (isProduction()) {
      throw new Error('PostgreSQL is required in production.');
    }

    return await initializeSqlite();
  })();

  try {
    return await initPromise;
  } catch (error) {
    dbClient = null;
    dbType = null;
    throw error;
  } finally {
    initPromise = null;
  }
}

async function query(sql, params = []) {
  if (!dbClient) {
    await initDb();
  }

  if (dbType === 'postgres') {
    const convertedSql = convertPostgresPlaceholders(sql);
    return dbClient.query(convertedSql, params);
  }

  return dbClient.query(sql, params);
}

async function getOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows && result.rows.length ? result.rows[0] : null;
}

async function getAll(sql, params = []) {
  const result = await query(sql, params);
  return result.rows || [];
}

function getDbType() {
  return dbType || 'uninitialized';
}

// Kept for compatibility with existing imports.
// This function no longer persists a fake in-memory database.
async function persistMemoryToFile() {
  if (dbType !== 'sqlite' || !dbClient) {
    return false;
  }

  const tableNames = [
    'users',
    'wallets',
    'tasks',
    'task_submissions',
    'transactions',
    'withdrawals',
    'referrals',
    'notifications',
    'admin_users',
    'audit_logs',
    'system_settings'
  ];

  const backup = {};

  for (const table of tableNames) {
    backup[table] = await getAll(`SELECT * FROM ${table}`);
  }

  fs.writeFileSync(
    MEMORY_BACKUP_FILE,
    JSON.stringify(backup, null, 2),
    'utf8'
  );

  return true;
}

module.exports = {
  initDb,
  query,
  getOne,
  getAll,
  getDbType,
  persistMemoryToFile
};

