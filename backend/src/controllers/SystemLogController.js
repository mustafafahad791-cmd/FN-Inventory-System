const pool = require('../utils/db');

// Get all system logs with filtering
const getAll = async (req, res) => {
  try {
    const { action_type, entity_type, status, branch_id, startDate, endDate, limit = 100 } = req.query;

    let query = 'SELECT * FROM SystemLog WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (action_type) {
      query += ` AND action_type = $${paramIndex}`;
      params.push(action_type);
      paramIndex++;
    }

    if (entity_type) {
      query += ` AND entity_type = $${paramIndex}`;
      params.push(entity_type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (branch_id) {
      query += ` AND branch_id = $${paramIndex}`;
      params.push(branch_id);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND log_timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND log_timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY log_timestamp DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Log a system action
const logAction = async (req, res) => {
  try {
    const { action_type, action_description, entity_type, entity_id, branch_id, user_id, status } = req.body;

    if (!action_type) {
      return res.status(400).json({ error: 'Action type is required' });
    }

    const result = await pool.query(
      `INSERT INTO SystemLog (action_type, action_description, entity_type, entity_id, branch_id, user_id, status, log_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [action_type, action_description || null, entity_type || null, entity_id || null, branch_id || null, user_id || null, status || 'success']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error logging action:', error);
    res.status(500).json({ error: 'Failed to log action' });
  }
};

// Get logs by date range
const getByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    const result = await pool.query(
      `SELECT 
        DATE(log_timestamp) as log_date,
        action_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
      FROM SystemLog
      WHERE log_timestamp >= $1 AND log_timestamp <= $2
      GROUP BY DATE(log_timestamp), action_type
      ORDER BY DATE(log_timestamp) DESC`,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs by date range:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get logs by entity
const getByEntity = async (req, res) => {
  try {
    const { entityId } = req.params;

    const result = await pool.query(
      `SELECT * FROM SystemLog
       WHERE entity_id = $1
       ORDER BY log_timestamp DESC
       LIMIT 100`,
      [entityId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching entity logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get logs by user
const getByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT * FROM SystemLog
       WHERE user_id = $1
       ORDER BY log_timestamp DESC
       LIMIT 200`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get logs by branch
const getByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const result = await pool.query(
      `SELECT * FROM SystemLog
       WHERE branch_id = $1
       ORDER BY log_timestamp DESC
       LIMIT 200`,
      [branchId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching branch logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get system statistics
const getStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_logs,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_logs,
        COUNT(DISTINCT action_type) as unique_actions,
        COUNT(DISTINCT entity_type) as unique_entities,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT branch_id) as branches_involved,
        MAX(log_timestamp) as last_activity,
        MIN(log_timestamp) as first_activity
      FROM SystemLog
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get action breakdown
const getActionBreakdown = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        action_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
        ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / COUNT(*), 2) as success_rate
      FROM SystemLog
      GROUP BY action_type
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching action breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch action breakdown' });
  }
};

// Get entity breakdown
const getEntityBreakdown = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        entity_type,
        COUNT(*) as count,
        COUNT(DISTINCT entity_id) as unique_entities,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count
      FROM SystemLog
      WHERE entity_type IS NOT NULL
      GROUP BY entity_type
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching entity breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch entity breakdown' });
  }
};

// Get error logs
const getErrors = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(`
      SELECT * FROM SystemLog
      WHERE status = 'error'
      ORDER BY log_timestamp DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
};

// Get system health summary
const getHealthSummary = async (req, res) => {
  try {
    const last24hResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
      FROM SystemLog
      WHERE log_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);

    const last7dResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
      FROM SystemLog
      WHERE log_timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `);

    const errorRateLast24h = last24hResult.rows[0].total > 0 
      ? (last24hResult.rows[0].errors / last24hResult.rows[0].total * 100).toFixed(2)
      : 0;

    const errorRateLast7d = last7dResult.rows[0].total > 0 
      ? (last7dResult.rows[0].errors / last7dResult.rows[0].total * 100).toFixed(2)
      : 0;

    res.json({
      last_24_hours: {
        total_actions: last24hResult.rows[0].total,
        errors: last24hResult.rows[0].errors,
        error_rate: errorRateLast24h
      },
      last_7_days: {
        total_actions: last7dResult.rows[0].total,
        errors: last7dResult.rows[0].errors,
        error_rate: errorRateLast7d
      }
    });
  } catch (error) {
    console.error('Error fetching health summary:', error);
    res.status(500).json({ error: 'Failed to fetch health summary' });
  }
};

module.exports = {
  getAll,
  logAction,
  getByDateRange,
  getByEntity,
  getByUser,
  getByBranch,
  getStats,
  getActionBreakdown,
  getEntityBreakdown,
  getErrors,
  getHealthSummary
};
