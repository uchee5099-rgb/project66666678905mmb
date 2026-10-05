# EarnFlow — Your Gateway to Online Rewards

EarnFlow is an original, production-quality fintech task-rewards web application inspired by clean, minimalist reward platforms. It features an original green-based fintech brand identity (`#16A34A`), robust PostgreSQL and SQLite database schema, Express REST API with Paystack payment gateway integration, and a mobile-first React + Vite + Tailwind CSS frontend.

---

## Brand Identity & Design System

* **Brand Name**: EarnFlow
* **Tagline**: "Your Gateway to Online Rewards"
* **Primary Green**: `#16A34A` (Tailwind `brand-600`)
* **Dark Tone**: `#111827` (Tailwind `dark`)
* **Light Background**: `#F8FAFC` (Tailwind `surface-light`)
* **Card Surface**: `#FFFFFF`
* **Muted Text**: `#64748B`
* **Borders**: `#E2E8F0`
* **Typography**: Modern Inter font hierarchy
* **Visuals**: Original vector illustrations representing digital rewards, upward financial trajectories, and verified bank payouts.

---

## Key Features

1. **Task Marketplace (`/tasks`, `/tasks/:id`)**:
   - Browse tasks across categories: Surveys, Apps, Social, Reviews, Other.
   - Live search by keyword and category filters.
   - Comprehensive instructions, requirements, and proof submission modal.
   - Real-time user submission status tracking (Pending Review, Approved, Declined).

2. **Wallet & Financial Ledger (`/dashboard`, `/earnings`)**:
   - Live database-driven balances: Available Balance, Total Earned, Pending Rewards, Referral Rewards.
   - Filterable transaction history with audit reference tokens.

3. **Paystack Account Activation (₦1,000 Fee)**:
   - **Frontend Public Key**: `pk_test_ec3ec80f29d09bebab36838824c6ad2e30dae836`
   - **Backend Secret Key**: `sk_test_043d8864e5808137f1ccd4661341ed1e245821a1`
   - **Fee Amount**: ₦1,000.00 (100,000 kobo).
   - In order to initiate withdrawals, user accounts must be activated.
   - Clicking "Activate Account" directs the user to the Paystack payment gateway (supporting both inline popup modal and redirect checkout).
   - Once payment is verified by Paystack on the backend, account transitions to `pending_confirmation`.
   - **Admin Confirmation Required**: If an account activation is not confirmed by an administrator, any attempt to withdraw generates the exact error message:
     ```
     "account not activated"
     ```
   - Admins can review paid activations in `/admin/users` and click "Confirm Activation", which unlocks bank payouts for the user.

4. **Nigerian NUBAN Withdrawals (`/withdraw`)**:
   - Guarded by account activation status: unactivated or unconfirmed users receive the error message `"account not activated"`.
   - Instant validation of amount against available balance and configured minimum threshold (₦1,000.00).
   - Support for all major commercial banks & fintechs (Access, GTBank, Zenith, Kuda, OPay, PalmPay, UBA, First Bank, etc.).
   - Exact 10-digit NUBAN validation with real-time disbursement status tracking.

5. **Referral Program (`/referrals`)**:
   - Unique referral code and link (`https://.../register?ref=CODE`).
   - One-click copy buttons and native sharing to WhatsApp, X (Twitter), and Telegram.
   - ₦250.00 referral bonus tracking with full referred user table.

6. **Admin Console (`/admin`)**:
   - Protected with role-based authorization (`role === 'admin'`).
   - Dashboard metrics: Total users, active users, available tasks, pending submission queue, pending withdrawal queue, total rewards paid.
   - User directory (`/admin/users`): Search, filter by activation status, confirm account activations with one click, suspend/activate accounts.
   - Task manager (`/admin/tasks`): Create, edit, delete, activate/deactivate campaigns.
   - Submission moderation (`/admin/submissions`): Review evidence, one-click Approve (instantly credits user wallet & logs transaction) and Reject (with feedback).
   - Withdrawal management (`/admin/withdrawals`): Review payout requests, mark processing, approve & complete, or decline & refund.
   - Financial ledger (`/admin/transactions`) & immutable administrative audit logs (`/admin/audit-logs`).
   - Platform settings (`/admin/settings`): Configure minimum withdrawal, referral bonus, and maintenance toggle.

---

## Pre-Configured Demo Credentials

The database comes pre-seeded with realistic demonstration accounts for immediate testing:

| Role | Email | Password | Activation Status | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@earnflow.ng` | `AdminPass123!` | Activated | Access to `/admin` console, moderation queues, activation confirmations, audit logs. |
| **Demo User** | `chidi@earnflow.ng` | `UserPass123!` | Activated | Active user with ₦3,500 balance, past tasks, and withdrawal access. |
| **Referred User** | `amaka@earnflow.ng` | `UserPass123!` | Unactivated | User referred by Chidi. Demonstrates unactivated account state and ₦1,000 Paystack fee prompt. |

*Quick Demo Sign-in buttons are also provided on the `/login` page for one-click authentication.*

---

## Database Schema

The database supports both PostgreSQL and embedded SQLite with identical tables, foreign keys, and indexes:

1. `users`: Stores member credentials, password hashes, referral codes, and activation columns (`is_activated`, `activation_status`, `activation_reference`, `activation_paid_at`, `activation_confirmed_at`, `activation_confirmed_by`).
2. `admin_users`: Explicit administrator privileges and role tracking.
3. `wallets`: 1-to-1 ledger tracking `available_balance`, `total_earned`, `pending_rewards`, `referral_rewards`, `total_withdrawn`.
4. `tasks`: Marketplace reward campaigns with instructions, categories, requirements, and proof types.
5. `task_submissions`: User submissions with evidence/proof, status (`pending`, `approved`, `rejected`), reviewer notes.
6. `transactions`: Immutable financial ledger (`Task Reward`, `Referral Reward`, `Withdrawal`, `Adjustment`, `Activation Fee`).
7. `withdrawals`: Payout requests with bank name, 10-digit NUBAN, status (`pending`, `processing`, `completed`, `rejected`).
8. `referrals`: Referrer-referred pairings with bonus allocations.
9. `notifications`: In-app notification feed with read receipts.
10. `audit_logs`: Detailed administrative trail of all financial and compliance actions.
11. `system_settings`: Platform-wide configurations (minimum withdrawal amount, referral bonus, etc.).

---

## Project Architecture

```
earnflow/
├── client/                     # Frontend Application
│   ├── index.html              # HTML5 entry with Inter font & Paystack Inline SDK
│   ├── vite.config.js          # Vite configuration with API proxy to port 5000
│   ├── tailwind.config.js      # Custom EarnFlow color palette & styling
│   ├── package.json
│   ├── .env                    # VITE_PAYSTACK_PUBLIC_KEY
│   └── src/
│       ├── main.jsx            # React root
│       ├── App.jsx             # React Router routing configuration
│       ├── index.css           # Tailwind directives & smooth animations
│       ├── components/         # Navbar, Footer, Modal, StatCard, etc.
│       ├── context/            # AuthContext, ToastContext
│       ├── layouts/            # PublicLayout, DashboardLayout, AdminLayout
│       ├── pages/              # Home, Register, Login, Tasks, Withdraw, etc.
│       └── services/           # API client
│
├── server/                     # Backend REST API
│   ├── server.js               # Express application entrypoint
│   ├── package.json
│   ├── .env                    # Paystack secret key, JWT, DB URLs
│   ├── test.js                 # Automated API test suite (23 passing tests)
│   ├── controllers/            # Auth, tasks, wallet, withdrawals, admin, user
│   ├── services/
│   │   └── paystackService.js  # Paystack initialization & verification with secret key
│   ├── middleware/             # Auth JWT verification & admin guard
│   ├── routes/                 # REST endpoints
│   └── database/
│       ├── db.js               # Dual-engine DB adapter (PostgreSQL + SQLite fallback)
│       ├── migrations/
│       │   └── 001_initial_schema.sql  # Production PostgreSQL DDL
│       └── seeds/
│           ├── 001_seed.sql    # PostgreSQL SQL seed
│           └── seed.js         # Dynamic bcrypt seed runner
│
└── README.md
```

---

## Installation & Setup Instructions

### Prerequisites
* **Node.js**: v18+ (tested on Node.js v24.21.0)
* **npm**: v9+ (tested on npm 11.19.0)
* **PostgreSQL** (Optional for production; SQLite engine is included for zero-config local development)

### 1. Clone or Open the Workspace
Navigate to the `earnflow` directory:
```bash
cd earnflow
```

### 2. Backend Setup & Configuration
Navigate to `server`:
```bash
cd server
cp .env.example .env
npm install
```

Configure your `.env` file:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/earnflow

# Set to true to use automatic local database fallback if Postgres is unavailable
USE_SQLITE_FALLBACK=true

JWT_SECRET=earnflow_super_secure_jwt_secret_key_2026_production
JWT_EXPIRES_IN=7d

# Paystack Gateway (Public key on frontend, secret key ONLY on backend)
PAYSTACK_SECRET_KEY=sk_test_043d8864e5808137f1ccd4661341ed1e245821a1
PAYSTACK_PUBLIC_KEY=pk_test_ec3ec80f29d09bebab36838824c6ad2e30dae836
ACTIVATION_FEE_AMOUNT=1000.00

MIN_WITHDRAWAL_AMOUNT=1000.00
REFERRAL_BONUS_AMOUNT=250.00
```

### 3. Run Database Migrations & Seeds
Populate the database with initial schema and demo data:
```bash
npm run seed
```

### 4. Run Automated Backend Tests
Verify all 23 integration endpoints including Paystack fee verification and admin activation confirmation:
```bash
npm test
```

### 5. Frontend Setup
Navigate to `client`:
```bash
cd ../client
npm install
```

Configure `client/.env`:
```env
VITE_API_URL=/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_ec3ec80f29d09bebab36838824c6ad2e30dae836
```

---

## Development Commands

### Running Backend in Development:
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Running Frontend in Development:
```bash
cd client
npm run dev
# Vite server starts at http://localhost:5173
```

---

## Production Build Instructions

### 1. Build Frontend
```bash
cd client
npm run build
```
This produces an optimized production bundle in `client/dist`.

### 2. Run Production Server
In production, point your reverse proxy (Nginx or Cloudflare) to the Express server running on Node:
```bash
cd server
NODE_ENV=production node server.js
```

---

## PostgreSQL Database Setup (Production)

To connect directly to a live PostgreSQL database server:
1. Create a database named `earnflow`:
   ```sql
   CREATE DATABASE earnflow;
   ```
2. Apply the schema migration:
   ```bash
   psql -d earnflow -f server/database/migrations/001_initial_schema.sql
   ```
3. Apply the initial seed data:
   ```bash
   psql -d earnflow -f server/database/seeds/001_seed.sql
   ```
4. Set `DATABASE_URL=postgresql://username:password@your-host:5432/earnflow` in `server/.env`.
5. Start the server. The application will immediately utilize PostgreSQL with full transaction isolation!
