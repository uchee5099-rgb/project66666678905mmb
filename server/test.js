/**
 * EarnFlow Backend Automated Verification Test Suite
 * Tests Registration, Authentication, Tasks, Submissions, Wallet Crediting,
 * Paystack Account Activation, Admin Confirmation Enforcement, Withdrawals, and Referrals.
 */

const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n============================================================');
  console.log('  RUNNING EARNFLOW API INTEGRATION TESTS');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API Health Check');

    // 2. User Login (Chidi - Activated demo account)
    const userLogin = await request('POST', '/auth/login', {
      email: 'chidi@earnflow.ng',
      password: 'UserPass123!'
    });
    assert(userLogin.status === 200 && userLogin.body.token && userLogin.body.user.isActivated, 'Demo User Login (chidi@earnflow.ng isActivated=true)');
    const userToken = userLogin.body.token;

    // 3. Admin Login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@earnflow.ng',
      password: 'AdminPass123!'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin Login (admin@earnflow.ng)');
    const adminToken = adminLogin.body.token;

    // 4. Registration with Referral Code (New user is unactivated by default)
    const testEmail = `tester_${Date.now()}@earnflow.ng`;
    const regRes = await request('POST', '/auth/register', {
      fullName: 'Emeka Nwosu',
      email: testEmail,
      phone: '+2348099887766',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      referralCode: 'CHIDI88'
    });
    assert(regRes.status === 201 && regRes.body.token && regRes.body.user.isActivated === false, 'New User Registration with isActivated=false');
    const newUserToken = regRes.body.token;
    const newUserId = regRes.body.user.id;

    // 5. Unactivated User Attempts Withdrawal -> MUST FAIL with "account not activated"
    const unactivatedWithdraw = await request('POST', '/withdrawals', {
      amount: 1000,
      bankName: 'Access Bank',
      accountNumber: '0123456789',
      accountName: 'Emeka Nwosu'
    }, newUserToken);
    assert(
      unactivatedWithdraw.status === 403 && unactivatedWithdraw.body.error === 'account not activated',
      'Unactivated User Withdrawal Blocked with exact error: "account not activated"'
    );

    // 6. User Initializes Paystack Account Activation
    const initPaystack = await request('POST', '/user/activate/initialize', {}, newUserToken);
    assert(
      initPaystack.status === 200 && initPaystack.body.amount === 1000.00 && initPaystack.body.publicKey.startsWith('pk_test_'),
      'User Initializes Paystack Activation Fee (₦1,000.00 with configured public key)'
    );

    // 7. User Submits Paystack Payment Reference for Verification
    const testPayRef = `TEST-ACT-${Date.now()}`;
    const verifyPaystack = await request('POST', '/user/activate/verify', { reference: testPayRef }, newUserToken);
    assert(
      verifyPaystack.status === 200 && verifyPaystack.body.activationStatus === 'pending_confirmation',
      'User Verifies Paystack Payment -> Status set to "pending_confirmation"'
    );

    // 8. User Attempts Withdrawal while Pending Admin Confirmation -> MUST STILL FAIL with "account not activated"
    const pendingWithdraw = await request('POST', '/withdrawals', {
      amount: 1000,
      bankName: 'Access Bank',
      accountNumber: '0123456789',
      accountName: 'Emeka Nwosu'
    }, newUserToken);
    assert(
      pendingWithdraw.status === 403 && pendingWithdraw.body.error === 'account not activated',
      'Pending Admin Confirmation Withdrawal Blocked with exact error: "account not activated"'
    );

    // 9. Admin Views User in List with pending_confirmation status
    const adminUserList = await request('GET', `/admin/users?search=${encodeURIComponent(testEmail)}`, null, adminToken);
    assert(
      adminUserList.status === 200 && adminUserList.body.users.length > 0 && adminUserList.body.users[0].activationStatus === 'pending_confirmation',
      'Admin Inspects User in Directory with pending_confirmation status'
    );

    // 10. Admin Confirms User Account Activation
    const confirmAct = await request('PUT', `/admin/users/${newUserId}/confirm-activation`, {}, adminToken);
    assert(
      confirmAct.status === 200,
      'Admin Confirms User Account Activation via /api/admin/users/:id/confirm-activation'
    );

    // 11. User Checks Profile / Auth Me -> isActivated is now true
    const meRes = await request('GET', '/auth/me', null, newUserToken);
    assert(
      meRes.status === 200 && meRes.body.user.isActivated === true && meRes.body.user.activationStatus === 'activated',
      'User Profile /auth/me Confirms isActivated=true & activationStatus=activated'
    );

    // 12. Browse Available Tasks
    const tasksRes = await request('GET', '/tasks', null, newUserToken);
    assert(tasksRes.status === 200 && tasksRes.body.tasks.length >= 5, `Browse Tasks Marketplace (${tasksRes.body.tasks.length} tasks found)`);
    const testTask = tasksRes.body.tasks[0];

    // 13. Submit Task Proof
    const submitRes = await request('POST', `/tasks/${testTask.id}/submit`, {
      proofContent: 'Completed banking questionnaire. Confirmation code: TEST-PROOF-2026. Excellent interface.'
    }, newUserToken);
    assert(submitRes.status === 201 && submitRes.body.submissionStatus === 'pending', 'User Submits Task Proof');

    // 14. Check Pending Rewards in Wallet
    const walletBefore = await request('GET', '/wallet', null, newUserToken);
    assert(walletBefore.status === 200 && walletBefore.body.wallet.pendingRewards === testTask.rewardAmount,
      `Wallet Pending Rewards Updated to ₦${testTask.rewardAmount}`);

    // 15. Admin Reviews Pending Submissions Queue
    const adminSubs = await request('GET', '/admin/submissions?status=pending', null, adminToken);
    assert(adminSubs.status === 200 && adminSubs.body.submissions.length > 0, 'Admin Fetches Pending Submissions Queue');
    const submissionToApprove = adminSubs.body.submissions.find(s => s.userId === newUserId);
    assert(!!submissionToApprove, 'Admin Finds New User Submission in Queue');

    // 16. Admin Approves Submission
    const approveRes = await request('PUT', `/admin/submissions/${submissionToApprove.id}`, {
      action: 'approve',
      adminNotes: 'Automated test verification approved.'
    }, adminToken);
    assert(approveRes.status === 200 && approveRes.body.status === 'approved', 'Admin Approves Submission & Credits Wallet');

    // 17. Check User Wallet Balance Credited
    const walletAfter = await request('GET', '/wallet', null, newUserToken);
    assert(walletAfter.status === 200 &&
      walletAfter.body.wallet.availableBalance === testTask.rewardAmount &&
      walletAfter.body.wallet.pendingRewards === 0,
      `User Available Balance Credited with ₦${testTask.rewardAmount} and Pending Cleared`);

    // 18. Request Withdrawal by Chidi (Activated account with sufficient funds)
    const withdrawRes = await request('POST', '/withdrawals', {
      amount: 1000,
      bankName: 'Access Bank',
      accountNumber: '0123456789',
      accountName: 'Chidi Okonkwo'
    }, userToken);
    assert(withdrawRes.status === 201 && withdrawRes.body.withdrawal.status === 'pending', 'Activated User Successfully Requests Bank Withdrawal');

    // 19. Admin Processes Withdrawal
    const adminWds = await request('GET', '/admin/withdrawals?status=pending', null, adminToken);
    assert(adminWds.status === 200 && adminWds.body.withdrawals.length > 0, 'Admin Views Pending Withdrawals');
    const pendingWd = adminWds.body.withdrawals[0];

    const approveWd = await request('PUT', `/admin/withdrawals/${pendingWd.id}`, {
      action: 'approve_completed',
      adminNotes: 'Disbursed via automated payout gateway.'
    }, adminToken);
    assert(approveWd.status === 200, 'Admin Approves and Completes Withdrawal');

    // 20. Referrals check
    const referralsRes = await request('GET', '/referrals', null, userToken);
    assert(referralsRes.status === 200 && referralsRes.body.referrals.length >= 1, 'Referral Tracking Data Returned');

    // 21. Audit logs check
    const auditRes = await request('GET', '/admin/audit-logs', null, adminToken);
    const hasActivationAudit = auditRes.body.logs.some(l => l.action === 'CONFIRM_USER_ACTIVATION');
    assert(auditRes.status === 200 && hasActivationAudit, `Admin Audit Trail Includes CONFIRM_USER_ACTIVATION (${auditRes.body.logs.length} total entries)`);

    console.log('\n============================================================');
    console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

// Start test runner
runTests();
