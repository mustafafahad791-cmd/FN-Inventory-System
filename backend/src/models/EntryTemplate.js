// EntryTemplate Model
const pool = require('../utils/db');

class EntryTemplate {
  static async create(itemId, name, specifications, unitPrice) {
    const result = await pool.query(
      'INSERT INTO EntryTemplate (item_id, name, specifications, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
      [itemId, name, JSON.stringify(specifications), unitPrice]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM EntryTemplate WHERE is_active = true');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM EntryTemplate WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByItemId(itemId) {
    const result = await pool.query('SELECT * FROM EntryTemplate WHERE item_id = $1 AND is_active = true', [itemId]);
    return result.rows;
  }

  static async update(id, name, specifications, unitPrice) {
    const result = await pool.query(
      'UPDATE EntryTemplate SET name = $1, specifications = $2, unit_price = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, JSON.stringify(specifications), unitPrice, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('UPDATE EntryTemplate SET is_active = false WHERE id = $1', [id]);
  }
}

module.exports = EntryTemplate;
