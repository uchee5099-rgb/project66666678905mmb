const { query, getOne, getAll } = require('../database/db');

/**
 * Get All Active Tasks with Filters & Search
 * GET /api/tasks
 */
async function getTasks(req, res) {
  try {
    const { category, search } = req.query;
    const userId = req.user ? req.user.id : null;

    let sql = `
      SELECT t.id, t.title, t.category, t.reward_amount, t.estimated_minutes,
             t.description, t.proof_type, t.max_participants, t.status, t.created_at
      FROM tasks t
      WHERE t.status = 'active'
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND t.category = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (t.title LIKE $${params.length} OR t.description LIKE $${params.length})`;
    }

    sql += ' ORDER BY t.reward_amount DESC, t.id ASC';

    const tasks = await getAll(sql, params);

    // If user is authenticated, attach their submission status for each task
    let userSubmissions = {};
    if (userId) {
      const subs = await getAll('SELECT task_id, status FROM task_submissions WHERE user_id = $1', [userId]);
      for (const s of subs) {
        userSubmissions[s.task_id] = s.status;
      }
    }

    const formatted = tasks.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      rewardAmount: parseFloat(t.reward_amount),
      estimatedMinutes: t.estimated_minutes,
      description: t.description,
      proofType: t.proof_type,
      status: t.status,
      userSubmissionStatus: userSubmissions[t.id] || null // null, 'pending', 'approved', 'rejected'
    }));

    res.json({
      tasks: formatted,
      count: formatted.length
    });
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve available tasks.' });
  }
}

/**
 * Get Single Task Details
 * GET /api/tasks/:id
 */
async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const task = await getOne(
      `SELECT id, title, category, reward_amount, estimated_minutes, description,
              instructions, requirements, proof_type, max_participants, status, created_at
       FROM tasks WHERE id = $1`,
      [id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    let userSubmission = null;
    if (userId) {
      userSubmission = await getOne(
        `SELECT id, proof_content, proof_image_url, status, admin_notes, submitted_at, reviewed_at
         FROM task_submissions WHERE task_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1`,
        [id, userId]
      );
    }

    res.json({
      task: {
        id: task.id,
        title: task.title,
        category: task.category,
        rewardAmount: parseFloat(task.reward_amount),
        estimatedMinutes: task.estimated_minutes,
        description: task.description,
        instructions: task.instructions,
        requirements: task.requirements,
        proofType: task.proof_type,
        maxParticipants: task.max_participants,
        status: task.status,
        createdAt: task.created_at,
        userSubmission: userSubmission ? {
          id: userSubmission.id,
          proofContent: userSubmission.proof_content,
          proofImageUrl: userSubmission.proof_image_url,
          status: userSubmission.status,
          adminNotes: userSubmission.admin_notes,
          submittedAt: userSubmission.submitted_at,
          reviewedAt: userSubmission.reviewed_at
        } : null
      }
    });
  } catch (err) {
    console.error('getTaskById error:', err);
    res.status(500).json({ error: 'Failed to retrieve task details.' });
  }
}

/**
 * Submit Proof for Task
 * POST /api/tasks/:id/submit
 */
async function submitTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { proofContent, proofImageUrl } = req.body;

    if (!proofContent || !proofContent.trim()) {
      return res.status(400).json({ error: 'Please provide proof details or evidence of completion.' });
    }

    const task = await getOne('SELECT id, title, reward_amount, status FROM tasks WHERE id = $1', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task does not exist.' });
    }

    if (task.status !== 'active') {
      return res.status(400).json({ error: 'This task is currently inactive or closed.' });
    }

    // Check if already submitted and pending or approved
    const existing = await getOne(
      'SELECT id, status FROM task_submissions WHERE task_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({ error: 'You have already completed this task and received your reward.' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'You already have a pending submission for this task under review.' });
      }
      // If rejected, user may re-submit
    }

    const reward = parseFloat(task.reward_amount);

    if (existing && existing.status === 'rejected') {
      // Re-submit
      await query(
        `UPDATE task_submissions
         SET proof_content = $1, proof_image_url = $2, status = 'pending', admin_notes = NULL, submitted_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [proofContent.trim(), proofImageUrl || null, existing.id]
      );
    } else {
      // New submission
      await query(
        `INSERT INTO task_submissions (task_id, user_id, proof_content, proof_image_url, status)
         VALUES ($1, $2, $3, $4, 'pending')`,
        [id, userId, proofContent.trim(), proofImageUrl || null]
      );
    }

    // Update pending rewards in user wallet
    await query(
      'UPDATE wallets SET pending_rewards = pending_rewards + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [reward, userId]
    );

    // Add notification
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [
        userId,
        'Task Submitted for Review',
        `Your evidence for "${task.title}" has been submitted. ₦${reward.toFixed(2)} is currently in pending rewards awaiting admin verification.`,
        'info'
      ]
    );

    res.status(201).json({
      message: 'Task submission received! Your proof is currently under review.',
      submissionStatus: 'pending',
      rewardAmount: reward
    });
  } catch (err) {
    console.error('submitTask error:', err);
    res.status(500).json({ error: 'Failed to submit task proof.' });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  submitTask
};
