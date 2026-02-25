// Inventory Model
const pool = require('../utils/db');

class Inventory {
  static async create(branchId, entryTemplateId, quantity) {
    const result = await pool.query(
      'INSERT INTO Inventory (branch_id, entry_template_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [branchId, entryTemplateId, quantity]
    );
    return result.rows[0];
  }

  static async findByBranchAndTemplate(branchId, entryTemplateId) {
    const result = await pool.query(
      'SELECT * FROM Inventory WHERE branch_id = $1 AND entry_template_id = $2',
      [branchId, entryTemplateId]
    );
    return result.rows[0];
  }

  static async findByBranch(branchId) {
    const result = await pool.query(
      'SELECT i.*, et.name, it.name as item_name FROM Inventory i JOIN EntryTemplate et ON i.entry_template_id = et.id JOIN Item it ON et.item_id = it.id WHERE i.branch_id = $1',
      [branchId]
    );
    return result.rows;
  }

  static async updateQuantity(branchId, entryTemplateId, quantity) {
    const result = await pool.query(
      'UPDATE Inventory SET quantity = $1, last_updated = CURRENT_TIMESTAMP WHERE branch_id = $2 AND entry_template_id = $3 RETURNING *',
      [quantity, branchId, entryTemplateId]
    );
    return result.rows[0];
  }

  static async incrementQuantity(branchId, entryTemplateId, amount) {
    const result = await pool.query(
      'UPDATE Inventory SET quantity = quantity + $1, last_updated = CURRENT_TIMESTAMP WHERE branch_id = $2 AND entry_template_id = $3 RETURNING *',
      [amount, branchId, entryTemplateId]
    );
    return result.rows[0];
  }

  static async decrementQuantity(branchId, entryTemplateId, amount) {
    const result = await pool.query(
      'UPDATE Inventory SET quantity = GREATEST(0, quantity - $1), last_updated = CURRENT_TIMESTAMP WHERE branch_id = $2 AND entry_template_id = $3 RETURNING *',
      [amount, branchId, entryTemplateId]
    );
    return result.rows[0];
  }
}

module.exports = Inventory;
