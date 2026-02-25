const pool = require('../utils/db');

// Get or create customer
const getOrCreateCustomer = async (req, res) => {
  try {
    const { customerId, name, phone } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }

    // Check if customer exists
    const existResult = await pool.query(
      'SELECT id, customer_id, name, phone FROM Customer WHERE customer_id = $1',
      [customerId]
    );

    if (existResult.rows.length > 0) {
      return res.json(existResult.rows[0]);
    }

    // Create new customer
    const result = await pool.query(
      `INSERT INTO Customer (customer_id, name, phone, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, customer_id, name, phone, created_at`,
      [customerId, name || null, phone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error managing customer:', error);
    res.status(500).json({ error: 'Failed to manage customer' });
  }
};

// Get all customers
const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        MAX(r.receipt_timestamp) as last_purchase_date,
        c.created_at
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      GROUP BY c.id, c.customer_id, c.name, c.phone, c.created_at
      ORDER BY total_spent DESC
      LIMIT 200
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent,
        c.created_at
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Search customers
const search = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.trim().length === 0) {
      return res.status(400).json({ error: 'Search term required' });
    }

    const searchTerm = `%${term}%`;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.customer_id,
        c.name,
        c.phone,
        COUNT(r.id) as total_purchases,
        COALESCE(SUM(r.total_price), 0) as total_spent
      FROM Customer c
      LEFT JOIN Receipt r ON c.id = r.customer_id
      WHERE 
        c.customer_id ILIKE $1 OR
        c.name ILIKE $1 OR
        c.phone ILIKE $1
      GROUP BY c.id, c.customer_id, c.name, c.phone
      ORDER BY total_spent DESC
      LIMIT 50`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
};

module.exports = {
  getOrCreateCustomer,
  getAll,
  getById,
  search
};
