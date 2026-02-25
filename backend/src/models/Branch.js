// Branch Model
const pool = require('../utils/db');

class Branch {
  static async create(name, location) {
    const result = await pool.query(
      'INSERT INTO Branch (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM Branch WHERE is_active = true');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Branch WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, name, location) {
    const result = await pool.query(
      'UPDATE Branch SET name = $1, location = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, location, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('UPDATE Branch SET is_active = false WHERE id = $1', [id]);
  }
}

module.exports = Branch;
