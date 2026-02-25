const pool = require('../utils/db');

// Get all customers with purchase history
const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(DISTINCT r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        MAX(r.receipt_timestamp) as last_purchase_date,
        AVG(r.total_price) as avg_purchase_value,
        c.created_at
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      GROUP BY c.id, c.customer_id, c.name, c.phone, c.created_at
      ORDER BY total_spent DESC, last_purchase_date DESC
      LIMIT 500
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer purchase history with details
const getPurchaseHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer details
    const customerResult = await pool.query(
      `SELECT id, customer_id, name, phone, created_at FROM Customer WHERE id = $1`,
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];

    // Get purchase history
    const historyResult = await pool.query(`
      SELECT 
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        r.total_price,
        r.receipt_timestamp,
        COUNT(ri.id) as item_count,
        STRING_AGG(DISTINCT i.name, ', ') as items_purchased
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      LEFT JOIN EntryTemplate et ON ri.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE r.customer_id = $1
      GROUP BY r.id, r.receipt_id, r.branch_id, b.name, r.total_price, r.receipt_timestamp
      ORDER BY r.receipt_timestamp DESC
      LIMIT 100
    `, [customerId]);

    // Calculate statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        COALESCE(AVG(r.total_price), 0) as avg_purchase,
        COALESCE(MAX(r.total_price), 0) as max_purchase,
        COALESCE(MIN(r.total_price), 0) as min_purchase,
        COALESCE(COUNT(DISTINCT r.branch_id), 0) as branches_visited
      FROM Receipt r
      WHERE r.customer_id = $1
    `, [customerId]);

    res.json({
      customer,
      statistics: statsResult.rows[0],
      purchases: historyResult.rows
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
};

// Get top customers
const getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(DISTINCT r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        MAX(r.receipt_timestamp) as last_purchase_date,
        COALESCE(AVG(r.total_price), 0) as avg_purchase
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      GROUP BY c.id, c.customer_id, c.name, c.phone
      ORDER BY total_spent DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
};

// Get repeat customers (customers with multiple purchases)
const getRepeatCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(DISTINCT r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        MAX(r.receipt_timestamp) as last_purchase_date,
        MIN(r.receipt_timestamp) as first_purchase_date,
        COALESCE(AVG(r.total_price), 0) as avg_purchase
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      GROUP BY c.id, c.customer_id, c.name, c.phone
      HAVING COUNT(DISTINCT r.id) > 1
      ORDER BY total_purchases DESC, total_spent DESC
      LIMIT 200
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching repeat customers:', error);
    res.status(500).json({ error: 'Failed to fetch repeat customers' });
  }
};

// Get customer purchase trends
const getPurchaseTrends = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { days = 90 } = req.query;

    const result = await pool.query(`
      SELECT 
        DATE(r.receipt_timestamp) as purchase_date,
        COUNT(r.id) as purchases_count,
        COALESCE(SUM(r.total_price), 0) as daily_total,
        COALESCE(AVG(r.total_price), 0) as daily_avg
      FROM Receipt r
      WHERE r.customer_id = $1 
        AND r.receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $2
      GROUP BY DATE(r.receipt_timestamp)
      ORDER BY DATE(r.receipt_timestamp) DESC
    `, [customerId, parseInt(days)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchase trends:', error);
    res.status(500).json({ error: 'Failed to fetch purchase trends' });
  }
};

// Get customer preferences (most purchased items)
const getCustomerPreferences = async (req, res) => {
  try {
    const { customerId } = req.params;

    const result = await pool.query(`
      SELECT 
        i.id as item_id,
        i.unique_id,
        i.name as item_name,
        et.id as template_id,
        et.name as template_name,
        COUNT(ri.id) as times_purchased,
        COALESCE(SUM(ri.quantity), 0) as total_quantity,
        COALESCE(AVG(ri.unit_price), 0) as avg_price_paid,
        MAX(ri.unit_price) as highest_price_paid,
        MIN(ri.unit_price) as lowest_price_paid
      FROM ReceiptItems ri
      LEFT JOIN Receipt r ON ri.receipt_id = r.id
      LEFT JOIN EntryTemplate et ON ri.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE r.customer_id = $1
      GROUP BY i.id, i.unique_id, i.name, et.id, et.name
      ORDER BY times_purchased DESC, total_quantity DESC
      LIMIT 50
    `, [customerId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer preferences:', error);
    res.status(500).json({ error: 'Failed to fetch customer preferences' });
  }
};

// Search customers by name, phone or ID
const search = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.trim().length === 0) {
      return res.status(400).json({ error: 'Search term required' });
    }

    const searchTerm = `%${term}%`;

    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(DISTINCT r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        MAX(r.receipt_timestamp) as last_purchase_date,
        COALESCE(AVG(r.total_price), 0) as avg_purchase
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      WHERE 
        c.customer_id ILIKE $1 OR
        c.name ILIKE $1 OR
        c.phone ILIKE $1
      GROUP BY c.id, c.customer_id, c.name, c.phone
      ORDER BY total_spent DESC
      LIMIT 100
    `, [searchTerm]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
};

// Get customer acquisition trends
const getAcquisitionTrends = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('week', c.created_at)::date as week_start,
        COUNT(c.id) as new_customers,
        COUNT(CASE WHEN COUNT(r.id) > 1 THEN 1 END) as repeat_customers
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      GROUP BY DATE_TRUNC('week', c.created_at)
      ORDER BY DATE_TRUNC('week', c.created_at) DESC
      LIMIT 52
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching acquisition trends:', error);
    res.status(500).json({ error: 'Failed to fetch acquisition trends' });
  }
};

module.exports = {
  getAll,
  getPurchaseHistory,
  getTopCustomers,
  getRepeatCustomers,
  getPurchaseTrends,
  getCustomerPreferences,
  search,
  getAcquisitionTrends
};
