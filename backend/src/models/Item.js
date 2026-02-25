// Item Model
const pool = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

class Item {
  static async create(name, category, description) {
    const uniqueId = `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await pool.query(
      'INSERT INTO Item (unique_id, name, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [uniqueId, name, category, description]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM Item WHERE is_active = true');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Item WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, name, category, description) {
    const result = await pool.query(
      'UPDATE Item SET name = $1, category = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, category, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('UPDATE Item SET is_active = false WHERE id = $1', [id]);
  }
}

module.exports = Item;
