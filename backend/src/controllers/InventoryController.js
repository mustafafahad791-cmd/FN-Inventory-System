const db = require('../utils/db');

class InventoryController {
  /**
   * Get all inventory records with template and branch details
   */
  static async getAll(req, res) {
    try {
      const query = `
        SELECT 
          i.id,
          i.branch_id,
          b.branch_name,
          b.location,
          i.entry_template_id,
          et.name as template_name,
          et.unit_price,
          item.item_name,
          item.category,
          i.quantity_in_stock,
          i.reorder_level,
          i.last_counted_at,
          i.created_at,
          i.updated_at,
          i.created_by,
          i.is_active
        FROM inventory i
        JOIN branch b ON i.branch_id = b.id
        JOIN entry_template et ON i.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE i.is_active = true
        ORDER BY b.branch_name, item.item_name, et.name
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Failed to fetch inventory records' });
    }
  }

  /**
   * Get inventory by ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const query = `
        SELECT 
          i.id,
          i.branch_id,
          b.branch_name,
          b.location,
          i.entry_template_id,
          et.name as template_name,
          et.unit_price,
          et.specifications,
          item.item_name,
          item.category,
          i.quantity_in_stock,
          i.reorder_level,
          i.last_counted_at,
          i.created_at,
          i.updated_at,
          i.created_by,
          i.is_active
        FROM inventory i
        JOIN branch b ON i.branch_id = b.id
        JOIN entry_template et ON i.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE i.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Failed to fetch inventory record' });
    }
  }

  /**
   * Get inventory by branch
   */
  static async getByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const query = `
        SELECT 
          i.id,
          i.branch_id,
          b.branch_name,
          i.entry_template_id,
          et.name as template_name,
          et.unit_price,
          item.item_name,
          item.category,
          i.quantity_in_stock,
          i.reorder_level,
          i.last_counted_at,
          i.created_at,
          i.updated_at,
          i.is_active
        FROM inventory i
        JOIN branch b ON i.branch_id = b.id
        JOIN entry_template et ON i.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE i.branch_id = $1 AND i.is_active = true
        ORDER BY item.item_name, et.name
      `;
      
      const result = await db.query(query, [branchId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching branch inventory:', error);
      res.status(500).json({ error: 'Failed to fetch branch inventory' });
    }
  }

  /**
   * Get inventory by template
   */
  static async getByTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const query = `
        SELECT 
          i.id,
          i.branch_id,
          b.branch_name,
          b.location,
          i.entry_template_id,
          et.name as template_name,
          et.unit_price,
          item.item_name,
          i.quantity_in_stock,
          i.reorder_level,
          i.last_counted_at,
          i.created_at,
          i.updated_at,
          i.is_active
        FROM inventory i
        JOIN branch b ON i.branch_id = b.id
        JOIN entry_template et ON i.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE i.entry_template_id = $1 AND i.is_active = true
        ORDER BY b.branch_name
      `;
      
      const result = await db.query(query, [templateId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching template inventory:', error);
      res.status(500).json({ error: 'Failed to fetch template inventory' });
    }
  }

  /**
   * Create new inventory record
   */
  static async create(req, res) {
    try {
      const { branchId, entryTemplateId, quantityInStock, reorderLevel } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!branchId || !entryTemplateId || quantityInStock === undefined) {
        return res.status(400).json({ 
          error: 'Branch ID, Template ID, and Quantity are required' 
        });
      }

      // Verify branch exists
      const branchCheck = await db.query(
        'SELECT id FROM branch WHERE id = $1 AND is_active = true',
        [branchId]
      );
      if (branchCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid branch ID' });
      }

      // Verify template exists
      const templateCheck = await db.query(
        'SELECT id FROM entry_template WHERE id = $1 AND is_active = true',
        [entryTemplateId]
      );
      if (templateCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }

      // Check for duplicate inventory record
      const duplicate = await db.query(
        `SELECT id FROM inventory 
         WHERE branch_id = $1 AND entry_template_id = $2 AND is_active = true`,
        [branchId, entryTemplateId]
      );
      if (duplicate.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Inventory record already exists for this branch/template combination' 
        });
      }

      const query = `
        INSERT INTO inventory (branch_id, entry_template_id, quantity_in_stock, reorder_level, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, branch_id, entry_template_id, quantity_in_stock, reorder_level, created_at, updated_at
      `;

      const result = await db.query(query, [
        branchId,
        entryTemplateId,
        quantityInStock,
        reorderLevel || 10,
        userId
      ]);

      res.status(201).json({
        message: 'Inventory record created successfully',
        inventory: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating inventory:', error);
      res.status(500).json({ error: 'Failed to create inventory record' });
    }
  }

  /**
   * Update inventory quantity and reorder level
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { quantityInStock, reorderLevel } = req.body;

      // At least one field must be provided
      if (quantityInStock === undefined && reorderLevel === undefined) {
        return res.status(400).json({ 
          error: 'At least one field must be updated' 
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (quantityInStock !== undefined) {
        updates.push(`quantity_in_stock = $${paramCount}`);
        values.push(quantityInStock);
        paramCount++;
      }

      if (reorderLevel !== undefined) {
        updates.push(`reorder_level = $${paramCount}`);
        values.push(reorderLevel);
        paramCount++;
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE inventory
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, branch_id, entry_template_id, quantity_in_stock, reorder_level, updated_at
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      res.json({
        message: 'Inventory updated successfully',
        inventory: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  /**
   * Adjust inventory quantity (add/remove)
   */
  static async adjust(req, res) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      const userId = req.user.id;

      if (quantity === undefined || quantity === 0) {
        return res.status(400).json({ 
          error: 'Quantity adjustment must be non-zero' 
        });
      }

      if (!reason) {
        return res.status(400).json({ 
          error: 'Reason for adjustment is required' 
        });
      }

      // Get current inventory
      const currentResult = await db.query(
        'SELECT quantity_in_stock FROM inventory WHERE id = $1 AND is_active = true',
        [id]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      const newQuantity = currentResult.rows[0].quantity_in_stock + quantity;

      if (newQuantity < 0) {
        return res.status(400).json({ 
          error: 'Adjustment would result in negative stock' 
        });
      }

      // Update inventory
      const updateResult = await db.query(
        `UPDATE inventory 
         SET quantity_in_stock = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, quantity_in_stock, updated_at`,
        [newQuantity, id]
      );

      // Log adjustment (optional - for audit trail)
      // This would be done in a separate system_log table

      res.json({
        message: 'Inventory adjusted successfully',
        inventory: updateResult.rows[0],
        adjustment: {
          quantity,
          reason,
          previousQuantity: currentResult.rows[0].quantity_in_stock,
          newQuantity,
          adjustedBy: userId,
          adjustedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      res.status(500).json({ error: 'Failed to adjust inventory' });
    }
  }

  /**
   * Delete (soft-delete) inventory record
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const query = `
        UPDATE inventory
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND is_active = true
        RETURNING id
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      res.json({ message: 'Inventory record deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      res.status(500).json({ error: 'Failed to delete inventory record' });
    }
  }

  /**
   * Get inventory statistics
   */
  static async getStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT branch_id) as branches_with_inventory,
          COUNT(DISTINCT entry_template_id) as templates_tracked,
          SUM(quantity_in_stock) as total_quantity,
          AVG(quantity_in_stock) as average_quantity,
          MIN(quantity_in_stock) as min_quantity,
          MAX(quantity_in_stock) as max_quantity,
          COUNT(CASE WHEN quantity_in_stock <= reorder_level THEN 1 END) as low_stock_count
        FROM inventory
        WHERE is_active = true
      `;

      const result = await db.query(query);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({ error: 'Failed to fetch inventory statistics' });
    }
  }

  /**
   * Get low stock items (quantity <= reorder level)
   */
  static async getLowStock(req, res) {
    try {
      const query = `
        SELECT 
          i.id,
          i.branch_id,
          b.branch_name,
          i.entry_template_id,
          et.name as template_name,
          item.item_name,
          i.quantity_in_stock,
          i.reorder_level,
          (i.reorder_level - i.quantity_in_stock) as shortage_quantity,
          i.last_counted_at
        FROM inventory i
        JOIN branch b ON i.branch_id = b.id
        JOIN entry_template et ON i.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE i.is_active = true AND i.quantity_in_stock <= i.reorder_level
        ORDER BY i.quantity_in_stock ASC
      `;

      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
  }
}

module.exports = InventoryController;
