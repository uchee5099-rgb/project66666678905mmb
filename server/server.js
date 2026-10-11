require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { initDb, getDbType } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again in a few minutes.' }
});
app.use('/api/', generalLimiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 login/register attempts per 15 min
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'EarnFlow API',
    tagline: 'Your Gateway to Online Rewards',
    environment: process.env.NODE_ENV || 'development',
    databaseEngine: getDbType(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Serve static React client build in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 Route Handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    console.log('Connecting to EarnFlow database...');
    await initDb();
    console.log(`Database engine active: [${getDbType().toUpperCase()}]`);
if (process.env.SEED_ADMIN === 'true') {
  const bcrypt = require('bcryptjs');
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { require: true, rejectUnauthorized: false }
  });
  (async () => {
    const hash = await bcrypt.hash('Uchman1472#', 10);
    await pool.query(`INSERT INTO users (full_name,email,password_hash,role,is_active,is_account_activated,referral_code) VALUES ('Uchenna Admin','uchennamister@gmail.com',$1,'admin',true,true,'ADMIN2026') ON CONFLICT (email) DO UPDATE SET password_hash=$1, role='admin'`, [hash]);
    console.log('ADMIN SEEDED');
  })();
                }
    app.listen(PORT, () => {
      console.log(`
============================================================
  EarnFlow Backend Server Running
  URL: http://localhost:${PORT}
  Health Check: http://localhost:${PORT}/api/health
  Environment: ${process.env.NODE_ENV || 'development'}
============================================================
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
