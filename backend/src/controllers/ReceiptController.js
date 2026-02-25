const pool = require('../utils/db');

// Get all receipts with item details
const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        r.customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        r.total_price,
        r.receipt_timestamp,
        r.created_at,
        COUNT(ri.id) as item_count
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN Customer c ON r.customer_id = c.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      GROUP BY r.id, r.receipt_id, r.branch_id, b.name, r.customer_id, c.name, c.phone, r.total_price, r.receipt_timestamp, r.created_at
      ORDER BY r.receipt_timestamp DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
};

// Get receipt by ID with full item details
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get receipt details
    const receiptResult = await pool.query(`
      SELECT 
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        b.location as branch_location,
        r.customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        c.customer_id as customer_unique_id,
        r.total_price,
        r.receipt_timestamp,
        r.created_at
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN Customer c ON r.customer_id = c.id
      WHERE r.id = $1
    `, [id]);

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = receiptResult.rows[0];

    // Get receipt items
    const itemsResult = await pool.query(`
      SELECT 
        ri.id,
        ri.entry_template_id,
        et.name as template_name,
        i.name as item_name,
        i.unique_id as item_id,
        et.unit_price,
        ri.quantity,
        ri.subtotal
      FROM ReceiptItems ri
      LEFT JOIN EntryTemplate et ON ri.entry_template_id = et.id
      LEFT JOIN Item i ON et.item_id = i.id
      WHERE ri.receipt_id = $1
      ORDER BY ri.id
    `, [id]);

    res.json({
      ...receipt,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
};

// Get receipts by branch
const getByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        r.customer_id,
        c.name as customer_name,
        r.total_price,
        r.receipt_timestamp,
        COUNT(ri.id) as item_count
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN Customer c ON r.customer_id = c.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      WHERE r.branch_id = $1
    `;
    let params = [branchId];

    if (startDate && endDate) {
      query += ` AND r.receipt_timestamp >= $2 AND r.receipt_timestamp <= $3`;
      params = [branchId, startDate, endDate];
    }

    query += `
      GROUP BY r.id, r.receipt_id, r.branch_id, b.name, r.customer_id, c.name, r.total_price, r.receipt_timestamp
      ORDER BY r.receipt_timestamp DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching branch receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
};

// Get receipts by customer
const getByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const result = await pool.query(`
      SELECT 
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        r.customer_id,
        c.name as customer_name,
        r.total_price,
        r.receipt_timestamp,
        COUNT(ri.id) as item_count
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN Customer c ON r.customer_id = c.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      WHERE r.customer_id = $1
      GROUP BY r.id, r.receipt_id, r.branch_id, b.name, r.customer_id, c.name, r.total_price, r.receipt_timestamp
      ORDER BY r.receipt_timestamp DESC
    `, [customerId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
};

// Create new receipt
const create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { branchId, customerId, items } = req.body;

    // Validation
    if (!branchId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing branch ID or items' });
    }

    // Verify branch exists
    const branchResult = await client.query('SELECT id FROM Branch WHERE id = $1 AND is_active = true', [branchId]);
    if (branchResult.rows.length === 0) {
      return res.status(400).json({ error: 'Branch not found' });
    }

    // Verify customer if provided
    if (customerId) {
      const customerResult = await client.query('SELECT id FROM Customer WHERE id = $1', [customerId]);
      if (customerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    // Calculate total and verify inventory
    let totalPrice = 0;
    for (const item of items) {
      const templateResult = await client.query(
        'SELECT unit_price FROM EntryTemplate WHERE id = $1 AND is_active = true',
        [item.entryTemplateId]
      );
      if (templateResult.rows.length === 0) {
        return res.status(400).json({ error: `Template ${item.entryTemplateId} not found` });
      }

      const unitPrice = parseFloat(templateResult.rows[0].unit_price);
      totalPrice += unitPrice * item.quantity;

      // Verify inventory
      const inventoryResult = await client.query(
        'SELECT quantity FROM Inventory WHERE branch_id = $1 AND entry_template_id = $2',
        [branchId, item.entryTemplateId]
      );
      if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient inventory for item ${item.entryTemplateId}` });
      }
    }

    // Start transaction
    await client.query('BEGIN');

    // Create receipt
    const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const receiptResult = await client.query(
      `INSERT INTO Receipt (receipt_id, branch_id, customer_id, total_price, receipt_timestamp)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, receipt_id, branch_id, customer_id, total_price, receipt_timestamp, created_at`,
      [receiptId, branchId, customerId || null, totalPrice]
    );

    const receipt = receiptResult.rows[0];
    const receiptDbId = receipt.id;

    // Insert receipt items and update inventory
    for (const item of items) {
      const templateResult = await client.query(
        'SELECT unit_price FROM EntryTemplate WHERE id = $1',
        [item.entryTemplateId]
      );
      const unitPrice = parseFloat(templateResult.rows[0].unit_price);
      const subtotal = unitPrice * item.quantity;

      // Insert receipt item
      await client.query(
        `INSERT INTO ReceiptItems (receipt_id, entry_template_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [receiptDbId, item.entryTemplateId, item.quantity, unitPrice, subtotal]
      );

      // Deduct from inventory
      await client.query(
        `UPDATE Inventory 
         SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
         WHERE branch_id = $2 AND entry_template_id = $3`,
        [item.quantity, branchId, item.entryTemplateId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(receipt);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating receipt:', error);
    res.status(500).json({ error: 'Failed to create receipt' });
  } finally {
    client.release();
  }
};

// Get receipt statistics
const getStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT r.id) as total_receipts,
        COUNT(DISTINCT r.customer_id) as unique_customers,
        COALESCE(SUM(r.total_price), 0) as total_sales,
        COALESCE(AVG(r.total_price), 0) as avg_receipt_value,
        COUNT(DISTINCT r.branch_id) as branches_with_sales
      FROM Receipt r
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching receipt stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get sales by date range
const getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing date range parameters' });
    }

    const result = await pool.query(`
      SELECT 
        DATE(r.receipt_timestamp) as date,
        COUNT(r.id) as receipt_count,
        COALESCE(SUM(r.total_price), 0) as daily_sales
      FROM Receipt r
      WHERE r.receipt_timestamp >= $1 AND r.receipt_timestamp <= $2
      GROUP BY DATE(r.receipt_timestamp)
      ORDER BY DATE(r.receipt_timestamp) DESC
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

// Search receipts
const search = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.trim().length === 0) {
      return res.status(400).json({ error: 'Search term required' });
    }

    const searchTerm = `%${term}%`;

    const result = await pool.query(`
      SELECT DISTINCT
        r.id,
        r.receipt_id,
        r.branch_id,
        b.name as branch_name,
        r.customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        r.total_price,
        r.receipt_timestamp,
        COUNT(ri.id) as item_count
      FROM Receipt r
      LEFT JOIN Branch b ON r.branch_id = b.id
      LEFT JOIN Customer c ON r.customer_id = c.id
      LEFT JOIN ReceiptItems ri ON r.id = ri.receipt_id
      WHERE 
        r.receipt_id ILIKE $1 OR
        c.name ILIKE $1 OR
        c.phone ILIKE $1 OR
        c.customer_id ILIKE $1
      GROUP BY r.id, r.receipt_id, r.branch_id, b.name, r.customer_id, c.name, c.phone, r.total_price, r.receipt_timestamp
      ORDER BY r.receipt_timestamp DESC
      LIMIT 50
    `, [searchTerm]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching receipts:', error);
    res.status(500).json({ error: 'Failed to search receipts' });
  }
};

module.exports = {
  getAll,
  getById,
  getByBranch,
  getByCustomer,
  create,
  getStats,
  getSalesByDateRange,
  search
};
