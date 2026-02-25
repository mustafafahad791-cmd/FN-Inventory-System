const pool = require('../utils/db');

// Get comprehensive dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Revenue metrics
    const revenueResult = await pool.query(`
      SELECT 
        COALESCE(SUM(r.total_price), 0) as total_revenue,
        COUNT(r.id) as total_receipts,
        COALESCE(AVG(r.total_price), 0) as avg_receipt_value,
        COALESCE(MAX(r.total_price), 0) as max_receipt,
        COALESCE(MIN(r.total_price), 0) as min_receipt
      FROM Receipt r
      WHERE r.receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
    `, [days]);

    // Inventory metrics
    const inventoryResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT i.branch_id) as branches_count,
        COUNT(DISTINCT i.entry_template_id) as unique_templates,
        COALESCE(SUM(i.quantity), 0) as total_items_in_stock,
        COALESCE(AVG(i.quantity), 0) as avg_stock_level
      FROM Inventory i
    `);

    // Customer metrics
    const customerResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE WHEN COUNT(r.id) > 1 THEN c.id END) as repeat_customers,
        COALESCE(AVG(revenue_per_customer.total), 0) as avg_customer_value
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      LEFT JOIN (
        SELECT r2.customer_id, SUM(r2.total_price) as total
        FROM Receipt r2
        GROUP BY r2.customer_id
      ) revenue_per_customer ON c.id = revenue_per_customer.customer_id
      GROUP BY c.id
    `);

    // Top products
    const topProductsResult = await pool.query(`
      SELECT 
        i.name as item_name,
        et.name as template_name,
        COALESCE(SUM(ri.quantity), 0) as total_sold,
        COALESCE(SUM(ri.subtotal), 0) as total_revenue,
        COALESCE(AVG(ri.unit_price), 0) as avg_price
      FROM ReceiptItems ri
      LEFT JOIN EntryTemplate et ON ri.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE ri.receipt_id IN (
        SELECT id FROM Receipt WHERE receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      )
      GROUP BY i.id, i.name, et.id, et.name
      ORDER BY total_sold DESC
      LIMIT 10
    `, [days]);

    // Branch performance
    const branchPerformanceResult = await pool.query(`
      SELECT 
        b.id,
        b.name,
        COUNT(r.id) as receipts_count,
        COALESCE(SUM(r.total_price), 0) as branch_revenue,
        COUNT(DISTINCT r.customer_id) as unique_customers,
        COALESCE(AVG(r.total_price), 0) as avg_receipt
      FROM Branch b
      LEFT JOIN Receipt r ON b.id = r.branch_id AND r.receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      GROUP BY b.id, b.name
      ORDER BY branch_revenue DESC
    `, [days]);

    // Daily revenue trend
    const dailyTrendResult = await pool.query(`
      SELECT 
        DATE(r.receipt_timestamp) as date,
        COUNT(r.id) as receipt_count,
        COALESCE(SUM(r.total_price), 0) as daily_revenue
      FROM Receipt r
      WHERE r.receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      GROUP BY DATE(r.receipt_timestamp)
      ORDER BY DATE(r.receipt_timestamp) DESC
    `, [days]);

    res.json({
      revenue: revenueResult.rows[0],
      inventory: inventoryResult.rows[0],
      customers: customerResult.rows[0] || {},
      top_products: topProductsResult.rows,
      branch_performance: branchPerformanceResult.rows,
      daily_trend: dailyTrendResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    let query = `
      SELECT 
        DATE(r.receipt_timestamp) as date,
        b.name as branch_name,
        COUNT(r.id) as receipt_count,
        COUNT(DISTINCT r.customer_id) as customer_count,
        COALESCE(SUM(r.total_price), 0) as daily_revenue,
        COALESCE(AVG(r.total_price), 0) as avg_receipt,
        COALESCE(SUM(ri.quantity), 0) as items_sold
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      WHERE r.receipt_timestamp >= $1 AND r.receipt_timestamp <= $2
    `;

    let params = [startDate, endDate];

    if (branchId) {
      query += ` AND r.branch_id = $3`;
      params.push(branchId);
    }

    query += ` GROUP BY DATE(r.receipt_timestamp), b.id, b.name
      ORDER BY DATE(r.receipt_timestamp) DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
};

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    const { branchId } = req.query;

    let query = `
      SELECT 
        b.name as branch_name,
        i.name as item_name,
        et.name as template_name,
        inv.quantity as current_stock,
        et.unit_price,
        (inv.quantity * et.unit_price) as stock_value,
        CASE 
          WHEN inv.quantity = 0 THEN 'Out of Stock'
          WHEN inv.quantity < 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END as status
      FROM Inventory inv
      LEFT JOIN Branch b ON inv.branch_id = b.id
      LEFT JOIN EntryTemplate et ON inv.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE 1=1
    `;

    let params = [];
    if (branchId) {
      query += ` AND b.id = $1`;
      params.push(branchId);
    }

    query += ` ORDER BY b.name, inv.quantity ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ error: 'Failed to fetch inventory report' });
  }
};

// Get product performance report
const getProductPerformance = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT 
        i.name as item_name,
        et.name as template_name,
        COALESCE(COUNT(ri.id), 0) as times_sold,
        COALESCE(SUM(ri.quantity), 0) as total_quantity,
        COALESCE(SUM(ri.subtotal), 0) as total_revenue,
        COALESCE(AVG(ri.unit_price), 0) as avg_price,
        COALESCE(MAX(ri.unit_price), 0) as max_price,
        COALESCE(MIN(ri.unit_price), 0) as min_price
      FROM ReceiptItems ri
      LEFT JOIN EntryTemplate et ON ri.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE ri.receipt_id IN (
        SELECT id FROM Receipt WHERE receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      )
      GROUP BY i.id, i.name, et.id, et.name
      ORDER BY total_revenue DESC
      LIMIT 50
    `, [days]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product performance:', error);
    res.status(500).json({ error: 'Failed to fetch product performance' });
  }
};

// Get customer segmentation
const getCustomerSegmentation = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        CASE 
          WHEN total_purchases = 1 THEN 'One-time'
          WHEN total_purchases >= 2 AND total_purchases <= 5 THEN 'Occasional'
          WHEN total_purchases > 5 THEN 'Regular'
        END as segment,
        COUNT(*) as customer_count,
        COALESCE(AVG(total_spent), 0) as avg_spent,
        COALESCE(SUM(total_spent), 0) as segment_revenue
      FROM (
        SELECT 
          c.id,
          COUNT(r.id) as total_purchases,
          COALESCE(SUM(r.total_price), 0) as total_spent
        FROM Customer c
        LEFT JOIN Receipt r ON c.id = r.customer_id
        GROUP BY c.id
      ) customer_data
      GROUP BY segment
      ORDER BY segment
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer segmentation:', error);
    res.status(500).json({ error: 'Failed to fetch customer segmentation' });
  }
};

// Get transfer analytics
const getTransferAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT 
        b1.name as from_branch,
        b2.name as to_branch,
        COUNT(t.id) as transfer_count,
        COALESCE(SUM(t.quantity), 0) as total_quantity,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_transfers,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_transfers
      FROM Transfer t
      LEFT JOIN Branch b1 ON t.from_branch_id = b1.id
      LEFT JOIN Branch b2 ON t.to_branch_id = b2.id
      WHERE t.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      GROUP BY b1.id, b1.name, b2.id, b2.name
      ORDER BY transfer_count DESC
    `, [days]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transfer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch transfer analytics' });
  }
};

// Get key performance indicators
const getKPIs = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Month-to-date metrics
    const mtdResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_price), 0) as mtd_revenue,
        COUNT(*) as mtd_transactions,
        COUNT(DISTINCT customer_id) as mtd_unique_customers
      FROM Receipt
      WHERE DATE_TRUNC('month', receipt_timestamp) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Year-to-date metrics
    const ytdResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_price), 0) as ytd_revenue,
        COUNT(*) as ytd_transactions
      FROM Receipt
      WHERE DATE_TRUNC('year', receipt_timestamp) = DATE_TRUNC('year', CURRENT_DATE)
    `);

    // Growth rate (comparing to same period last month)
    const growthResult = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1 THEN total_price ELSE 0 END), 0) as current_period,
        COALESCE(SUM(CASE WHEN receipt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * ($1 * 2) AND receipt_timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day' * $1 THEN total_price ELSE 0 END), 0) as previous_period
      FROM Receipt
    `, [days]);

    const { current_period, previous_period } = growthResult.rows[0];
    const growth_rate = previous_period > 0 
      ? (((current_period - previous_period) / previous_period) * 100).toFixed(2)
      : 0;

    res.json({
      mtd: mtdResult.rows[0],
      ytd: ytdResult.rows[0],
      growth_rate: parseFloat(growth_rate)
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getSalesReport,
  getInventoryReport,
  getProductPerformance,
  getCustomerSegmentation,
  getTransferAnalytics,
  getKPIs
};
