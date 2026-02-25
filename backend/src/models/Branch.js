// Branch Model
const pool = require('../utils/db');

class Branch {
  static async create(name, location, phone = null, email = null) {
    try {
      const result = await pool.query(
        'INSERT INTO Branch (name, location, phone, email, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, location, phone, email, is_active, created_at, updated_at',
        [name, location, phone, email]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Branch name or phone already exists');
      }
      throw error;
    }
  }

  static async getAll() {
    const result = await pool.query(
      'SELECT id, name, location, phone, email, is_active, created_at, updated_at FROM Branch WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT id, name, location, phone, email, is_active, created_at, updated_at FROM Branch WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const { name, location, phone, email } = updates;
    try {
      const result = await pool.query(
        'UPDATE Branch SET name = COALESCE($1, name), location = COALESCE($2, location), phone = COALESCE($3, phone), email = COALESCE($4, email), updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND is_active = true RETURNING id, name, location, phone, email, is_active, created_at, updated_at',
        [name, location, phone, email, id]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Branch name or phone already exists');
      }
      throw error;
    }
  }

  static async deactivate(id) {
    const result = await pool.query(
      'UPDATE Branch SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, location, phone, email, is_active, created_at, updated_at',
      [id]
    );
    return result.rows[0];
  }

  static async search(query) {
    const searchTerm = `%${query}%`;
    const result = await pool.query(
      'SELECT id, name, location, phone, email, is_active, created_at, updated_at FROM Branch WHERE is_active = true AND (name ILIKE $1 OR location ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1) ORDER BY name ASC',
      [searchTerm]
    );
    return result.rows;
  }

  static async getStats(id) {
    const result = await pool.query(
      `SELECT 
        b.id, 
        b.name, 
        b.location,
        COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT r.id) as total_receipts,
        b.created_at
      FROM Branch b
      LEFT JOIN Inventory i ON b.id = i.branch_id
      LEFT JOIN Receipt r ON b.id = r.branch_id
      WHERE b.id = $1 AND b.is_active = true
      GROUP BY b.id, b.name, b.location, b.created_at`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Branch;
