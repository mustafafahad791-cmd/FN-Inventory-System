// Item Model
const pool = require('../utils/db');

class Item {
  // Create new item with auto-generated unique ID
  static async create(name, category, description) {
    const uniqueId = `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await pool.query(
      'INSERT INTO item (unique_id, name, category, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, unique_id, name, category, description, is_active, created_at, updated_at',
      [uniqueId, name, category, description]
    );
    return result.rows[0];
  }

  // Find all active items ordered by name
  static async findAll() {
    const result = await pool.query(
      'SELECT id, unique_id, name, category, description, is_active, created_at, updated_at FROM item WHERE is_active = true ORDER BY name ASC'
    );
    return result.rows;
  }

  // Find item by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, unique_id, name, category, description, is_active, created_at, updated_at FROM item WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Find item by name and category (for duplicate check)
  static async findByNameAndCategory(name, category) {
    const result = await pool.query(
      'SELECT id, unique_id, name, category, description, is_active FROM item WHERE LOWER(name) = LOWER($1) AND LOWER(category) = LOWER($2) AND is_active = true',
      [name, category]
    );
    return result.rows[0];
  }

  // Update item (partial updates supported)
  static async update(id, name, category, description) {
    const result = await pool.query(
      'UPDATE item SET name = $1, category = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, unique_id, name, category, description, is_active, created_at, updated_at',
      [name, category, description, id]
    );
    return result.rows[0];
  }

  // Deactivate item (soft delete)
  static async deactivate(id) {
    const result = await pool.query(
      'UPDATE item SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, unique_id, name, category, description, is_active, created_at, updated_at',
      [id]
    );
    return result.rows[0];
  }

  // Search items by name or category (case-insensitive)
  static async search(query) {
    const searchPattern = `%${query}%`;
    const result = await pool.query(
      'SELECT id, unique_id, name, category, description, is_active, created_at, updated_at FROM item WHERE is_active = true AND (name ILIKE $1 OR category ILIKE $1 OR description ILIKE $1) ORDER BY name ASC',
      [searchPattern]
    );
    return result.rows;
  }

  // Find items by category
  static async findByCategory(category) {
    const result = await pool.query(
      'SELECT id, unique_id, name, category, description, is_active, created_at, updated_at FROM item WHERE LOWER(category) = LOWER($1) AND is_active = true ORDER BY name ASC',
      [category]
    );
    return result.rows;
  }

  // Get all distinct categories
  static async getAllCategories() {
    const result = await pool.query(
      'SELECT DISTINCT category FROM item WHERE is_active = true ORDER BY category ASC'
    );
    return result.rows.map(row => row.category);
  }

  // Get item statistics
  static async getStats() {
    const result = await pool.query(
      'SELECT COUNT(*) as total_items, COUNT(DISTINCT category) as total_categories FROM item WHERE is_active = true'
    );
    const row = result.rows[0];
    return {
      total_items: parseInt(row.total_items, 10),
      total_categories: parseInt(row.total_categories, 10)
    };
  }
}

module.exports = Item;
