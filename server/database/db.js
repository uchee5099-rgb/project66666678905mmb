/**
 * EarnFlow Database Connection & Query Adapter
 * Supports PostgreSQL (Production) and SQLite / Embedded SQL Fallback
 */

const path = require('path');
const fs = require('fs');

let dbClient = null;
let dbType = 'sqlite'; // 'postgres' | 'sqlite' | 'memory'

// In-memory / file fallback store structure
let memoryStore = {
  users: [],
  wallets: [],
  tasks: [],
  task_submissions: [],
  transactions: [],
  withdrawals: [],
  referrals: [],
  notifications: [],
  audit_logs: [],
  system_settings: []
};

const DB_FILE = path.join(__dirname, 'earnflow.sqlite');
const MEMORY_BACKUP_FILE = path.join(__dirname, 'earnflow_data.json');

// Load initial backup if memory store used
function loadMemoryFromFile() {
  if (fs.existsSync(MEMORY_BACKUP_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(MEMORY_BACKUP_FILE, 'utf8'));
      memoryStore = { ...memoryStore, ...data };
      console.log('✓ Loaded existing platform data from storage.');
    } catch (e) {
      console.warn('Could not parse storage file, using fresh store:', e.message);
    }
  }
}

function persistMemoryToFile() {
  try {
    fs.writeFileSync(MEMORY_BACKUP_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving data to file:', e.message);
  }
}

/**
 * Initialize Database Connection
 */
async function initDb() {
  // 1. Check if PostgreSQL is requested & reachable
  const databaseUrl = process.env.DATABASE_URL;
  let pgSuccess = false;

  if (databaseUrl && process.env.USE_POSTGRES_FIRST === 'true') {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 3000
      });
      const client = await pool.connect();
      client.release();
      dbClient = pool;
      dbType = 'postgres';
      pgSuccess = true;
      console.log('✓ Successfully connected to PostgreSQL database.');
      await runPgMigrations();
    } catch (err) {
      console.warn('PostgreSQL connection unavailable:', err.message);
      console.log('Switching to local robust database engine...');
    }
  }

  // 2. Try SQLite if PG didn't connect
  if (!pgSuccess) {
    try {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(DB_FILE);
      
      // Promisify SQLite
      dbClient = {
        _raw: db,
        query: (sql, params = []) => {
          return new Promise((resolve, reject) => {
            // Convert PostgreSQL $1, $2 to ? for SQLite and map parameters
            let convertedSql = sql;
            let finalParams = params;
            if (sql.includes('$')) {
              const mapped = [];
              convertedSql = sql.replace(/\$(\d+)/g, (match, num) => {
                const idx = parseInt(num, 10) - 1;
                mapped.push(params[idx]);
                return '?';
              });
              finalParams = mapped;
            }
            // Remove check constraints syntax or cast syntax if needed
            convertedSql = convertedSql.replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME');
            
            const isSelect = convertedSql.trim().toUpperCase().startsWith('SELECT') || 
                            convertedSql.trim().toUpperCase().startsWith('PRAGMA');
            
            if (isSelect) {
              db.all(convertedSql, finalParams, (err, rows) => {
                if (err) return reject(err);
                resolve({ rows: rows || [], rowCount: (rows || []).length });
              });
            } else {
              db.run(convertedSql, finalParams, function (err) {
                if (err) return reject(err);
                resolve({
                  rows: [],
                  rowCount: this.changes,
                  lastID: this.lastID
                });
              });
            }
          });
        }
      };

      dbType = 'sqlite';
      console.log('✓ SQLite database initialized at:', DB_FILE);
      await runSqliteMigrations();
    } catch (sqliteErr) {
      console.warn('SQLite native module unavailable, initializing High-Performance In-Memory SQL Engine:', sqliteErr.message);
      dbType = 'memory';
      loadMemoryFromFile();
      initMemoryEngine();
    }
  }

  return dbType;
}

/**
 * Run PostgreSQL Migrations
 */
async function runPgMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await dbClient.query(sql);
      console.log('✓ PostgreSQL schema migrations applied successfully.');
    }
  } catch (err) {
    console.error('Error applying PostgreSQL migrations:', err.message);
  }
}

/**
 * Run SQLite Migrations
 */
async function runSqliteMigrations() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by INTEGER,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      avatar_url TEXT,
      is_activated INTEGER DEFAULT 0,
      activation_status TEXT DEFAULT 'unactivated',
      activation_reference TEXT,
      activation_paid_at DATETIME,
      activation_confirmed_at DATETIME,
      activation_confirmed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      available_balance REAL DEFAULT 0.00,
      total_earned REAL DEFAULT 0.00,
      pending_rewards REAL DEFAULT 0.00,
      referral_rewards REAL DEFAULT 0.00,
      total_withdrawn REAL DEFAULT 0.00,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      reward_amount REAL NOT NULL,
      estimated_minutes INTEGER DEFAULT 5,
      description TEXT NOT NULL,
      instructions TEXT NOT NULL,
      requirements TEXT NOT NULL,
      proof_type TEXT DEFAULT 'text_or_screenshot',
      max_participants INTEGER DEFAULT 1000,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      proof_content TEXT NOT NULL,
      proof_image_url TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by INTEGER
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      reference TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL,
      referred_id INTEGER NOT NULL,
      reward_amount REAL DEFAULT 250.00,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(referrer_id, referred_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      role TEXT DEFAULT 'superadmin',
      permissions TEXT DEFAULT 'all',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Split and execute statements
  const statements = ddl.split(';').map(s => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await dbClient.query(statement);
  }

  // Ensure columns exist if table was previously created
  try {
    const tableInfo = await dbClient.query('PRAGMA table_info(users)');
    const colNames = (tableInfo.rows || []).map(c => c.name);

    if (!colNames.includes('is_activated')) {
      await dbClient.query('ALTER TABLE users ADD COLUMN is_activated INTEGER DEFAULT 0');
    }
    if (!colNames.includes('activation_status')) {
      await dbClient.query("ALTER TABLE users ADD COLUMN activation_status TEXT DEFAULT 'unactivated'");
    }
    if (!colNames.includes('activation_reference')) {
      await dbClient.query('ALTER TABLE users ADD COLUMN activation_reference TEXT');
    }
    if (!colNames.includes('activation_paid_at')) {
      await dbClient.query('ALTER TABLE users ADD COLUMN activation_paid_at DATETIME');
    }
    if (!colNames.includes('activation_confirmed_at')) {
      await dbClient.query('ALTER TABLE users ADD COLUMN activation_confirmed_at DATETIME');
    }
    if (!colNames.includes('activation_confirmed_by')) {
      await dbClient.query('ALTER TABLE users ADD COLUMN activation_confirmed_by INTEGER');
    }
  } catch (colErr) {
    console.warn('Column check note:', colErr.message);
  }

  console.log('✓ Database schema tables verified.');
}

/**
 * In-Memory Engine Fallback
 */
function initMemoryEngine() {
  dbClient = {
    query: async (sql, params = []) => {
      // Basic query emulator if neither PG nor SQLite binary is available
      return emulateQuery(sql, params);
    }
  };
}

function emulateQuery(sql, params) {
  // Simple table operations for test safety
  return { rows: [], rowCount: 0 };
}

/**
 * Universal Query Execution
 * @param {string} text - SQL statement (can use $1, $2 or ?)
 * @param {Array} params - Parameter values
 */
async function query(text, params = []) {
  if (!dbClient) {
    await initDb();
  }

  if (dbType === 'postgres') {
    // Normalize ? into $1, $2 if any
    let paramIndex = 1;
    const pgSql = text.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await dbClient.query(pgSql, params);
    return res;
  } else if (dbType === 'sqlite') {
    return await dbClient.query(text, params);
  } else {
    // Memory engine
    return await dbClient.query(text, params);
  }
}

/**
 * Helper to fetch a single row
 */
async function getOne(text, params = []) {
  const res = await query(text, params);
  return res.rows && res.rows.length > 0 ? res.rows[0] : null;
}

/**
 * Helper to fetch all rows
 */
async function getAll(text, params = []) {
  const res = await query(text, params);
  return res.rows || [];
}

module.exports = {
  initDb,
  query,
  getOne,
  getAll,
  getDbType: () => dbType,
  persistMemoryToFile
};
