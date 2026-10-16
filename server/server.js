
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

// Trust Render's reverse proxy for client IP handling.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
]
  .filter(Boolean)
  .flatMap(origin => origin.split(',').map(value => value.trim()));

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// General API rate limiter
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests. Please try again later.'
    }
  })
);

// Authentication rate limiter
app.use(
  '/api/auth/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many authentication attempts. Please try again later.'
    }
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development request logger
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      console.log(
        `[API] ${req.method} ${req.originalUrl} -> ` +
        `${res.statusCode} (${Date.now() - start}ms)`
      );
    });

    next();
  });
}

app.get('/api/diagnostic-users-columns', async (req, res) => {
  const suppliedKey = req.get('x-diagnostic-key');
  const expectedKey = process.env.DIAGNOSTIC_KEY;

  if (!expectedKey || suppliedKey !== expectedKey) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const result = await require('./database/db').query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    res.json({
      database: require('./database/db').getDbType(),
      columns: result.rows.map(row => row.column_name)
    });
  } catch (err) {
    console.error('Diagnostic query failed:', err.message);
    res.status(500).json({ error: 'Diagnostic query failed' });
  }
});

// Health check
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

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Serve the React production build if it exists.
const clientDist = path.resolve(__dirname, '../client/dist');
const indexFile = path.join(clientDist, 'index.html');

if (fs.existsSync(indexFile)) {
  app.use(express.static(clientDist));

  // Regex works with Express 4 and Express 5.
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(indexFile, err => {
      if (err) next(err);
    });
  });
}

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error:
      status >= 500
        ? 'Internal Server Error'
        : err.message || 'Request failed'
  });
});

// Start the server only after database initialization succeeds.
async function startServer() {
  try {
    console.log('Connecting to EarnFlow database...');

    await initDb();

    console.log(`Database engine active: ${getDbType().toUpperCase()}`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`EarnFlow API listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exitCode = 1;
    throw err;
  }
}

if (require.main === module) {
  startServer().catch(() => {
    process.exit(1);
  });
}

module.exports = { app, startServer };
       
