const crypto = require('crypto');
const { query, getOne, getAll } = require('../database/db');

// Helper to record audit log
async function recordAudit(adminId, action, targetType, targetId, details, ip = '127.0.0.1') {
  try {
    await query(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, action, targetType, targetId, typeof details === 'object' ? JSON.stringify(details) : details, ip]
    );
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

/**
 * Admin Dashboard Statistics
 * GET /api/admin/stats
 */
async function getAdminStats(req, res) {
  try {
    const totalUsersRow = await getOne('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const activeUsersRow = await getOne('SELECT COUNT(*) as count FROM users WHERE role = "user" AND status = "active"');
    const tasksRow = await getOne('SELECT COUNT(*) as count FROM tasks WHERE status = "active"');
    const pendingSubsRow = await getOne('SELECT COUNT(*) as count FROM task_submissions WHERE status = "pending"');
    const pendingWdsRow = await getOne('SELECT COUNT(*) as count FROM withdrawals WHERE status = "pending"');
    
    // Total rewards paid/earned
    const totalEarnedRow = await getOne('SELECT SUM(total_earned) as total FROM wallets');
    const totalWithdrawnRow = await getOne('SELECT SUM(total_withdrawn) as total FROM wallets');

    res.json({
      stats: {
        totalUsers: parseInt(totalUsersRow?.count || 0, 10),
        activeUsers: parseInt(activeUsersRow?.count || 0, 10),
        availableTasks: parseInt(tasksRow?.count || 0, 10),
        pendingSubmissions: parseInt(pendingSubsRow?.count || 0, 10),
        pendingWithdrawals: parseInt(pendingWdsRow?.count || 0, 10),
        totalRewardsEarned: parseFloat(totalEarnedRow?.total || 0),
        totalRewardsWithdrawn: parseFloat(totalWithdrawnRow?.total || 0)
      }
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
}

/**
 * User Management: Get Users
 * GET /api/admin/users
 */
async function getAdminUsers(req, res) {
  try {
    const { search, status, activationStatus } = req.query;

    let sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.referral_code, u.role, u.status,
             u.is_activated, u.activation_status, u.activation_reference, u.activation_paid_at, u.activation_confirmed_at,
             u.created_at,
             w.available_balance, w.total_earned, w.pending_rewards
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.role = 'user'
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      sql += ` AND u.status = $${params.length}`;
    }

    if (activationStatus && activationStatus !== 'All') {
      params.push(activationStatus);
      sql += ` AND u.activation_status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (u.full_name LIKE $${params.length} OR u.email LIKE $${params.length} OR u.phone LIKE $${params.length} OR u.referral_code LIKE $${params.length})`;
    }

    sql += ' ORDER BY u.id DESC';

    const users = await getAll(sql, params);

    res.json({
      users: users.map(u => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        referralCode: u.referral_code,
        status: u.status,
        isActivated: Boolean(u.is_activated),
        activationStatus: u.activation_status || 'unactivated',
        activationReference: u.activation_reference,
        activationPaidAt: u.activation_paid_at,
        activationConfirmedAt: u.activation_confirmed_at,
        createdAt: u.created_at,
        wallet: {
          availableBalance: parseFloat(u.available_balance || 0),
          totalEarned: parseFloat(u.total_earned || 0),
          pendingRewards: parseFloat(u.pending_rewards || 0)
        }
      }))
    });
  } catch (err) {
    console.error('getAdminUsers error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
}

/**
 * User Management: Confirm User Account Activation
 * PUT /api/admin/users/:id/confirm-activation
 */
async function confirmUserActivation(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const targetUser = await getOne('SELECT id, full_name, email, is_activated, activation_status, activation_reference FROM users WHERE id = $1', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await query(
      `UPDATE users
       SET is_activated = 1,
           activation_status = 'activated',
           activation_confirmed_at = CURRENT_TIMESTAMP,
           activation_confirmed_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [adminId, id]
    );

    // Record audit
    await recordAudit(
      adminId,
      'CONFIRM_USER_ACTIVATION',
      'user',
      id,
      {
        targetEmail: targetUser.email,
        activationReference: targetUser.activation_reference
      },
      req.ip
    );

    // Send user in-app notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Account Activation Confirmed!', 'Congratulations! Your EarnFlow account activation has been confirmed by an administrator. You can now request bank withdrawals.', 'success')`,
      [id]
    );

    res.json({
      message: `Account activation for ${targetUser.full_name} has been confirmed. Withdrawals are now enabled for this user.`
    });
  } catch (err) {
    console.error('confirmUserActivation error:', err);
    res.status(500).json({ error: 'Failed to confirm user activation.' });
  }
}

/**
 * User Management: Update User Status (Activate / Suspend)
 * PUT /api/admin/users/:id/status
 */
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const targetUser = await getOne('SELECT id, full_name, email FROM users WHERE id = $1', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);

    await recordAudit(
      req.user.id,
      status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'user',
      id,
      { targetEmail: targetUser.email, reason: reason || 'Administrative action' },
      req.ip
    );

    res.json({ message: `User account successfully marked as ${status}.` });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
}

/**
 * Task Management: Get All Tasks (including Inactive)
 * GET /api/admin/tasks
 */
async function getAdminTasks(req, res) {
  try {
    const tasks = await getAll('SELECT * FROM tasks ORDER BY id DESC');
    res.json({
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        rewardAmount: parseFloat(t.reward_amount),
        estimatedMinutes: t.estimated_minutes,
        description: t.description,
        instructions: t.instructions,
        requirements: t.requirements,
        proofType: t.proof_type,
        maxParticipants: t.max_participants,
        status: t.status,
        createdAt: t.created_at
      }))
    });
  } catch (err) {
    console.error('getAdminTasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
}

/**
 * Task Management: Create Task
 * POST /api/admin/tasks
 */
async function createAdminTask(req, res) {
  try {
    const { title, category, rewardAmount, estimatedMinutes, description, instructions, requirements, proofType, maxParticipants } = req.body;

    if (!title || !category || !rewardAmount || !description || !instructions) {
      return res.status(400).json({ error: 'Please provide all required task fields.' });
    }

    const reward = parseFloat(rewardAmount);
    if (isNaN(reward) || reward <= 0) {
      return res.status(400).json({ error: 'Reward amount must be greater than zero.' });
    }

    await query(
      `INSERT INTO tasks (title, category, reward_amount, estimated_minutes, description, instructions, requirements, proof_type, max_participants, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')`,
      [
        title.trim(),
        category,
        reward,
        parseInt(estimatedMinutes || 5, 10),
        description.trim(),
        instructions.trim(),
        requirements ? requirements.trim() : 'Follow instructions accurately.',
        proofType || 'text',
        parseInt(maxParticipants || 1000, 10)
      ]
    );

    const newTask = await getOne('SELECT * FROM tasks WHERE title = $1 ORDER BY id DESC LIMIT 1', [title.trim()]);

    await recordAudit(req.user.id, 'CREATE_TASK', 'task', newTask.id, { title: newTask.title, reward }, req.ip);

    res.status(201).json({
      message: 'Task created successfully.',
      task: newTask
    });
  } catch (err) {
    console.error('createAdminTask error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
}

/**
 * Task Management: Update Task
 * PUT /api/admin/tasks/:id
 */
async function updateAdminTask(req, res) {
  try {
    const { id } = req.params;
    const { title, category, rewardAmount, estimatedMinutes, description, instructions, requirements, proofType, status } = req.body;

    const task = await getOne('SELECT id FROM tasks WHERE id = $1', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await query(
      `UPDATE tasks
       SET title = $1, category = $2, reward_amount = $3, estimated_minutes = $4,
           description = $5, instructions = $6, requirements = $7, proof_type = $8,
           status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [
        title,
        category,
        parseFloat(rewardAmount),
        parseInt(estimatedMinutes, 10),
        description,
        instructions,
        requirements,
        proofType,
        status,
        id
      ]
    );

    await recordAudit(req.user.id, 'UPDATE_TASK', 'task', id, { title, status }, req.ip);

    res.json({ message: 'Task updated successfully.' });
  } catch (err) {
    console.error('updateAdminTask error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
}

/**
 * Task Management: Delete Task
 * DELETE /api/admin/tasks/:id
 */
async function deleteAdminTask(req, res) {
  try {
    const { id } = req.params;
    const task = await getOne('SELECT id, title FROM tasks WHERE id = $1', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);
    await recordAudit(req.user.id, 'DELETE_TASK', 'task', id, { title: task.title }, req.ip);

    res.json({ message: 'Task removed successfully.' });
  } catch (err) {
    console.error('deleteAdminTask error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
}

/**
 * Submission Management: Get Submissions
 * GET /api/admin/submissions
 */
async function getAdminSubmissions(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT s.id, s.task_id, s.user_id, s.proof_content, s.proof_image_url, s.status,
             s.admin_notes, s.submitted_at, s.reviewed_at,
             t.title as task_title, t.reward_amount, t.category as task_category,
             u.full_name as user_name, u.email as user_email
      FROM task_submissions s
      JOIN tasks t ON s.task_id = t.id
      JOIN users u ON s.user_id = u.id
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      sql += ` WHERE s.status = $${params.length}`;
    }

    sql += ' ORDER BY s.id DESC';

    const submissions = await getAll(sql, params);

    res.json({
      submissions: submissions.map(s => ({
        id: s.id,
        taskId: s.task_id,
        taskTitle: s.task_title,
        taskCategory: s.task_category,
        rewardAmount: parseFloat(s.reward_amount),
        userId: s.user_id,
        userName: s.user_name,
        userEmail: s.user_email,
        proofContent: s.proof_content,
        proofImageUrl: s.proof_image_url,
        status: s.status,
        adminNotes: s.admin_notes,
        submittedAt: s.submitted_at,
        reviewedAt: s.reviewed_at
      }))
    });
  } catch (err) {
    console.error('getAdminSubmissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
}

/**
 * Submission Management: Review Submission (Approve / Reject)
 * PUT /api/admin/submissions/:id
 */
async function reviewSubmission(req, res) {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // action: 'approve' | 'reject'
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject.' });
    }

    const sub = await getOne(
      `SELECT s.id, s.task_id, s.user_id, s.status, t.title, t.reward_amount, u.full_name
       FROM task_submissions s
       JOIN tasks t ON s.task_id = t.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (!sub) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (sub.status !== 'pending') {
      return res.status(400).json({ error: `Submission has already been ${sub.status}.` });
    }

    const reward = parseFloat(sub.reward_amount);

    if (action === 'approve') {
      // 1. Mark submission approved
      await query(
        `UPDATE task_submissions
         SET status = 'approved', admin_notes = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
         WHERE id = $3`,
        [adminNotes || 'Submission verified and approved.', adminId, id]
      );

      // 2. Financial Update: Reduce pending_rewards, credit available_balance and total_earned
      await query(
        `UPDATE wallets
         SET pending_rewards = MAX(0, pending_rewards - $1),
             available_balance = available_balance + $1,
             total_earned = total_earned + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [reward, sub.user_id]
      );

      // 3. Insert transaction
      const txRef = `RW-EF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, reference)
         VALUES ($1, 'Task Reward', $2, $3, 'completed', $4)`,
        [sub.user_id, reward, `Reward for completing: ${sub.title}`, txRef]
      );

      // 4. Notify user
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Task Approved & Reward Credited!', $2, 'success')`,
        [
          sub.user_id,
          `Congratulations! Your submission for "${sub.title}" has been approved. ₦${reward.toFixed(2)} was credited to your available balance.`
        ]
      );

      // 5. Audit log
      await recordAudit(
        adminId,
        'APPROVE_SUBMISSION',
        'submission',
        id,
        { userId: sub.user_id, taskTitle: sub.title, rewardCredited: reward, txRef },
        req.ip
      );

      return res.json({
        message: `Submission approved. ₦${reward.toFixed(2)} has been credited to ${sub.full_name}'s wallet.`,
        status: 'approved'
      });
    } else {
      // Reject
      await query(
        `UPDATE task_submissions
         SET status = 'rejected', admin_notes = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
         WHERE id = $3`,
        [adminNotes || 'Proof does not meet verification requirements.', adminId, id]
      );

      // Remove from pending rewards
      await query(
        `UPDATE wallets
         SET pending_rewards = MAX(0, pending_rewards - $1), updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [reward, sub.user_id]
      );

      // Notify user
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Task Submission Declined', $2, 'warning')`,
        [
          sub.user_id,
          `Your submission for "${sub.title}" could not be approved. Reason: ${adminNotes || 'Proof did not meet guidelines.'} You may re-submit if appropriate.`
        ]
      );

      // Audit log
      await recordAudit(
        adminId,
        'REJECT_SUBMISSION',
        'submission',
        id,
        { userId: sub.user_id, taskTitle: sub.title, reason: adminNotes },
        req.ip
      );

      return res.json({
        message: 'Submission has been declined.',
        status: 'rejected'
      });
    }
  } catch (err) {
    console.error('reviewSubmission error:', err);
    res.status(500).json({ error: 'Failed to process submission review.' });
  }
}

/**
 * Withdrawal Management: Get All Withdrawals
 * GET /api/admin/withdrawals
 */
async function getAdminWithdrawals(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT w.id, w.user_id, w.amount, w.bank_name, w.account_number, w.account_name,
             w.status, w.admin_notes, w.created_at, w.updated_at,
             u.full_name as user_name, u.email as user_email, u.phone as user_phone
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      sql += ` WHERE w.status = $${params.length}`;
    }

    sql += ' ORDER BY w.id DESC';

    const withdrawals = await getAll(sql, params);

    res.json({
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        userId: w.user_id,
        userName: w.user_name,
        userEmail: w.user_email,
        userPhone: w.user_phone,
        amount: parseFloat(w.amount),
        bankName: w.bank_name,
        accountNumber: w.account_number,
        accountName: w.account_name,
        status: w.status,
        adminNotes: w.admin_notes,
        createdAt: w.created_at,
        updatedAt: w.updated_at
      }))
    });
  } catch (err) {
    console.error('getAdminWithdrawals error:', err);
    res.status(500).json({ error: 'Failed to retrieve withdrawals.' });
  }
}

/**
 * Withdrawal Management: Process Withdrawal
 * PUT /api/admin/withdrawals/:id
 */
async function processWithdrawal(req, res) {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // 'mark_processing' | 'approve_completed' | 'reject'
    const adminId = req.user.id;

    const wd = await getOne(
      `SELECT w.id, w.user_id, w.amount, w.bank_name, w.account_number, w.status, u.full_name
       FROM withdrawals w
       JOIN users u ON w.user_id = u.id
       WHERE w.id = $1`,
      [id]
    );

    if (!wd) {
      return res.status(404).json({ error: 'Withdrawal request not found.' });
    }

    const amount = parseFloat(wd.amount);

    if (action === 'mark_processing') {
      await query(
        `UPDATE withdrawals
         SET status = 'processing', admin_notes = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [adminNotes || 'Disbursement queued in banking settlement batch.', id]
      );

      await recordAudit(adminId, 'PROCESS_WITHDRAWAL', 'withdrawal', id, { amount, bank: wd.bank_name }, req.ip);

      return res.json({ message: 'Withdrawal marked as processing.' });
    }

    if (action === 'approve_completed') {
      // 1. Mark completed
      await query(
        `UPDATE withdrawals
         SET status = 'completed', admin_notes = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [adminNotes || 'Confirmed payout disbursed to recipient bank account.', id]
      );

      // 2. Increment user's total_withdrawn in wallet
      await query(
        `UPDATE wallets
         SET total_withdrawn = total_withdrawn + $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [amount, wd.user_id]
      );

      // 3. Mark transaction completed
      await query(
        `UPDATE transactions
         SET status = 'completed'
         WHERE id = (
           SELECT id FROM transactions
           WHERE user_id = $1 AND type = 'Withdrawal' AND status = 'pending'
           ORDER BY id DESC LIMIT 1
         )`,
        [wd.user_id]
      );

      // 4. Notify user
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Withdrawal Paid Out!', $2, 'success')`,
        [
          wd.user_id,
          `Your withdrawal of ₦${amount.toFixed(2)} to ${wd.bank_name} has been processed and paid out successfully.`
        ]
      );

      // 5. Audit log
      await recordAudit(adminId, 'COMPLETE_WITHDRAWAL', 'withdrawal', id, { amount, notes: adminNotes }, req.ip);

      return res.json({ message: 'Withdrawal completed and marked as paid.' });
    }

    if (action === 'reject') {
      // 1. Mark rejected
      await query(
        `UPDATE withdrawals
         SET status = 'rejected', admin_notes = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [adminNotes || 'Account name mismatch or invalid bank credentials.', id]
      );

      // 2. Refund balance back to user's available balance
      await query(
        `UPDATE wallets
         SET available_balance = available_balance + $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [amount, wd.user_id]
      );

      // 3. Mark transaction rejected and insert refund adjustment
      await query(
        `UPDATE transactions
         SET status = 'rejected'
         WHERE id = (
           SELECT id FROM transactions
           WHERE user_id = $1 AND type = 'Withdrawal' AND status = 'pending'
           ORDER BY id DESC LIMIT 1
         )`,
        [wd.user_id]
      );

      const refRef = `RF-EF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await query(
        `INSERT INTO transactions (user_id, type, amount, description, status, reference)
         VALUES ($1, 'Adjustment', $2, $3, 'completed', $4)`,
        [wd.user_id, amount, `Refund for rejected withdrawal: ${adminNotes || 'Bank details issue'}`, refRef]
      );

      // 4. Notify user
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, 'Withdrawal Request Declined & Funds Refunded', $2, 'warning')`,
        [
          wd.user_id,
          `Your withdrawal request of ₦${amount.toFixed(2)} was declined. Reason: ${adminNotes || 'Invalid bank information'}. The full amount has been refunded back to your available balance.`
        ]
      );

      // 5. Audit log
      await recordAudit(adminId, 'REJECT_WITHDRAWAL', 'withdrawal', id, { amount, reason: adminNotes }, req.ip);

      return res.json({ message: 'Withdrawal declined and funds refunded to user balance.' });
    }

    return res.status(400).json({ error: 'Invalid withdrawal action.' });
  } catch (err) {
    console.error('processWithdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal.' });
  }
}

/**
 * Platform Financial Ledger
 * GET /api/admin/transactions
 */
async function getAdminTransactions(req, res) {
  try {
    const { type, search } = req.query;

    let sql = `
      SELECT t.id, t.user_id, t.type, t.amount, t.description, t.status, t.reference, t.created_at,
             u.full_name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (type && type !== 'All') {
      params.push(type);
      sql += ` WHERE t.type = $${params.length}`;
    }

    sql += ' ORDER BY t.id DESC LIMIT 100';

    const transactions = await getAll(sql, params);

    res.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        userName: tx.user_name,
        userEmail: tx.user_email,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        status: tx.status,
        reference: tx.reference,
        createdAt: tx.created_at
      }))
    });
  } catch (err) {
    console.error('getAdminTransactions error:', err);
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
}

/**
 * Admin Audit Logs
 * GET /api/admin/audit-logs
 */
async function getAdminAuditLogs(req, res) {
  try {
    const logs = await getAll(`
      SELECT a.id, a.admin_id, a.action, a.target_type, a.target_id, a.details, a.ip_address, a.created_at,
             u.full_name as admin_name, u.email as admin_email
      FROM audit_logs a
      JOIN users u ON a.admin_id = u.id
      ORDER BY a.id DESC LIMIT 100
    `);

    res.json({
      logs: logs.map(l => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name,
        adminEmail: l.admin_email,
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id,
        details: l.details,
        ipAddress: l.ip_address,
        createdAt: l.created_at
      }))
    });
  } catch (err) {
    console.error('getAdminAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
}

/**
 * System Settings: Get & Update
 * GET /api/admin/settings
 * PUT /api/admin/settings
 */
async function getAdminSettings(req, res) {
  try {
    const settings = await getAll('SELECT * FROM system_settings');
    const settingsObj = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }
    res.json({ settings: settingsObj });
  } catch (err) {
    console.error('getAdminSettings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
}

async function updateAdminSettings(req, res) {
  try {
    const { minWithdrawal, referralBonus, maintenanceMode } = req.body;

    if (minWithdrawal !== undefined) {
      await query('UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = "min_withdrawal"', [minWithdrawal.toString()]);
    }
    if (referralBonus !== undefined) {
      await query('UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = "referral_bonus"', [referralBonus.toString()]);
    }
    if (maintenanceMode !== undefined) {
      await query('UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = "maintenance_mode"', [maintenanceMode.toString()]);
    }

    await recordAudit(req.user.id, 'UPDATE_SETTINGS', 'system', 0, { minWithdrawal, referralBonus, maintenanceMode }, req.ip);

    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('updateAdminSettings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
}

module.exports = {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  confirmUserActivation,
  getAdminTasks,
  createAdminTask,
  updateAdminTask,
  deleteAdminTask,
  getAdminSubmissions,
  reviewSubmission,
  getAdminWithdrawals,
  processWithdrawal,
  getAdminTransactions,
  getAdminAuditLogs,
  getAdminSettings,
  updateAdminSettings
};
