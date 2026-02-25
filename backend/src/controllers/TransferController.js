const db = require('../utils/db');

class TransferController {
  /**
   * Get all transfers with status and details
   */
  static async getAll(req, res) {
    try {
      const query = `
        SELECT 
          t.id,
          t.from_branch_id,
          fb.branch_name as from_branch,
          t.to_branch_id,
          tb.branch_name as to_branch,
          t.entry_template_id,
          et.name as template_name,
          item.item_name,
          t.quantity,
          t.status,
          t.transfer_date,
          t.received_date,
          t.created_by,
          u.username as created_by_username,
          t.notes,
          t.created_at,
          t.updated_at,
          t.is_active
        FROM transfer t
        JOIN branch fb ON t.from_branch_id = fb.id
        JOIN branch tb ON t.to_branch_id = tb.id
        JOIN entry_template et ON t.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        JOIN "user" u ON t.created_by = u.id
        WHERE t.is_active = true
        ORDER BY t.transfer_date DESC, t.created_at DESC
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  }

  /**
   * Get transfer by ID with all details
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const query = `
        SELECT 
          t.id,
          t.from_branch_id,
          fb.branch_name as from_branch,
          fb.location as from_location,
          t.to_branch_id,
          tb.branch_name as to_branch,
          tb.location as to_location,
          t.entry_template_id,
          et.name as template_name,
          et.unit_price,
          et.specifications,
          item.item_name,
          item.category,
          t.quantity,
          t.status,
          t.transfer_date,
          t.received_date,
          t.created_by,
          u.username as created_by_username,
          t.notes,
          t.created_at,
          t.updated_at
        FROM transfer t
        JOIN branch fb ON t.from_branch_id = fb.id
        JOIN branch tb ON t.to_branch_id = tb.id
        JOIN entry_template et ON t.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        JOIN "user" u ON t.created_by = u.id
        WHERE t.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transfer not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching transfer:', error);
      res.status(500).json({ error: 'Failed to fetch transfer' });
    }
  }

  /**
   * Get transfers from a specific branch
   */
  static async getFromBranch(req, res) {
    try {
      const { branchId } = req.params;
      const query = `
        SELECT 
          t.id,
          t.from_branch_id,
          t.to_branch_id,
          tb.branch_name as to_branch,
          t.entry_template_id,
          et.name as template_name,
          item.item_name,
          t.quantity,
          t.status,
          t.transfer_date,
          t.received_date,
          t.notes,
          t.created_at
        FROM transfer t
        JOIN branch tb ON t.to_branch_id = tb.id
        JOIN entry_template et ON t.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE t.from_branch_id = $1 AND t.is_active = true
        ORDER BY t.transfer_date DESC
      `;
      
      const result = await db.query(query, [branchId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching outgoing transfers:', error);
      res.status(500).json({ error: 'Failed to fetch outgoing transfers' });
    }
  }

  /**
   * Get transfers to a specific branch
   */
  static async getToBranch(req, res) {
    try {
      const { branchId } = req.params;
      const query = `
        SELECT 
          t.id,
          t.from_branch_id,
          fb.branch_name as from_branch,
          t.to_branch_id,
          t.entry_template_id,
          et.name as template_name,
          item.item_name,
          t.quantity,
          t.status,
          t.transfer_date,
          t.received_date,
          t.notes,
          t.created_at
        FROM transfer t
        JOIN branch fb ON t.from_branch_id = fb.id
        JOIN entry_template et ON t.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE t.to_branch_id = $1 AND t.is_active = true
        ORDER BY t.transfer_date DESC
      `;
      
      const result = await db.query(query, [branchId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching incoming transfers:', error);
      res.status(500).json({ error: 'Failed to fetch incoming transfers' });
    }
  }

  /**
   * Create new transfer request
   */
  static async create(req, res) {
    try {
      const { fromBranchId, toBranchId, entryTemplateId, quantity, notes } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!fromBranchId || !toBranchId || !entryTemplateId || !quantity) {
        return res.status(400).json({ 
          error: 'Missing required fields: fromBranchId, toBranchId, entryTemplateId, quantity' 
        });
      }

      // Prevent self-transfer
      if (fromBranchId === toBranchId) {
        return res.status(400).json({ error: 'Cannot transfer to the same branch' });
      }

      // Verify both branches exist
      const fromBranch = await db.query(
        'SELECT id FROM branch WHERE id = $1 AND is_active = true',
        [fromBranchId]
      );
      if (fromBranch.rows.length === 0) {
        return res.status(400).json({ error: 'From branch not found' });
      }

      const toBranch = await db.query(
        'SELECT id FROM branch WHERE id = $1 AND is_active = true',
        [toBranchId]
      );
      if (toBranch.rows.length === 0) {
        return res.status(400).json({ error: 'To branch not found' });
      }

      // Verify template exists
      const template = await db.query(
        'SELECT id FROM entry_template WHERE id = $1 AND is_active = true',
        [entryTemplateId]
      );
      if (template.rows.length === 0) {
        return res.status(400).json({ error: 'Entry template not found' });
      }

      // Check source inventory has sufficient stock
      const sourceInventory = await db.query(
        `SELECT quantity_in_stock FROM inventory 
         WHERE branch_id = $1 AND entry_template_id = $2 AND is_active = true`,
        [fromBranchId, entryTemplateId]
      );

      if (sourceInventory.rows.length === 0) {
        return res.status(400).json({ 
          error: 'No inventory record found for this template in source branch' 
        });
      }

      if (sourceInventory.rows[0].quantity_in_stock < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${sourceInventory.rows[0].quantity_in_stock}, Requested: ${quantity}` 
        });
      }

      // Create transfer
      const insertQuery = `
        INSERT INTO transfer (
          from_branch_id, 
          to_branch_id, 
          entry_template_id, 
          quantity, 
          status,
          transfer_date,
          notes,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
        RETURNING 
          id, 
          from_branch_id, 
          to_branch_id, 
          entry_template_id, 
          quantity, 
          status, 
          transfer_date,
          created_at
      `;

      const result = await db.query(insertQuery, [
        fromBranchId,
        toBranchId,
        entryTemplateId,
        quantity,
        'pending', // Default status
        notes || null,
        userId
      ]);

      res.status(201).json({
        message: 'Transfer created successfully',
        transfer: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating transfer:', error);
      res.status(500).json({ error: 'Failed to create transfer' });
    }
  }

  /**
   * Confirm/complete transfer (approve at destination)
   */
  static async confirm(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get transfer details
      const transferResult = await db.query(
        `SELECT 
          id, 
          from_branch_id, 
          to_branch_id, 
          entry_template_id, 
          quantity, 
          status 
         FROM transfer 
         WHERE id = $1 AND is_active = true`,
        [id]
      );

      if (transferResult.rows.length === 0) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      const transfer = transferResult.rows[0];

      if (transfer.status !== 'pending') {
        return res.status(400).json({ 
          error: `Cannot confirm transfer with status: ${transfer.status}` 
        });
      }

      // Update transfer status to completed
      const updateTransferQuery = `
        UPDATE transfer
        SET status = 'completed', received_date = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING id, status, received_date
      `;

      await db.query(updateTransferQuery, [id]);

      // Deduct from source branch inventory
      await db.query(
        `UPDATE inventory
         SET quantity_in_stock = quantity_in_stock - $1, updated_at = NOW()
         WHERE branch_id = $2 AND entry_template_id = $3`,
        [transfer.quantity, transfer.from_branch_id, transfer.entry_template_id]
      );

      // Add to destination branch inventory
      const destInventory = await db.query(
        `SELECT id, quantity_in_stock FROM inventory 
         WHERE branch_id = $1 AND entry_template_id = $2`,
        [transfer.to_branch_id, transfer.entry_template_id]
      );

      if (destInventory.rows.length > 0) {
        // Update existing inventory
        await db.query(
          `UPDATE inventory
           SET quantity_in_stock = quantity_in_stock + $1, updated_at = NOW()
           WHERE branch_id = $2 AND entry_template_id = $3`,
          [transfer.quantity, transfer.to_branch_id, transfer.entry_template_id]
        );
      } else {
        // Create new inventory record
        await db.query(
          `INSERT INTO inventory (branch_id, entry_template_id, quantity_in_stock, created_by)
           VALUES ($1, $2, $3, $4)`,
          [transfer.to_branch_id, transfer.entry_template_id, transfer.quantity, userId]
        );
      }

      res.json({
        message: 'Transfer completed successfully',
        transfer: {
          id: transfer.id,
          status: 'completed',
          received_date: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error confirming transfer:', error);
      res.status(500).json({ error: 'Failed to confirm transfer' });
    }
  }

  /**
   * Cancel transfer (only if pending)
   */
  static async cancel(req, res) {
    try {
      const { id } = req.params;

      const transferResult = await db.query(
        'SELECT status FROM transfer WHERE id = $1 AND is_active = true',
        [id]
      );

      if (transferResult.rows.length === 0) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transferResult.rows[0].status !== 'pending') {
        return res.status(400).json({ 
          error: 'Can only cancel pending transfers' 
        });
      }

      const result = await db.query(
        `UPDATE transfer
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1
         RETURNING id, status, updated_at`,
        [id]
      );

      res.json({
        message: 'Transfer cancelled',
        transfer: result.rows[0]
      });
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      res.status(500).json({ error: 'Failed to cancel transfer' });
    }
  }

  /**
   * Delete transfer (soft-delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE transfer
         SET is_active = false, updated_at = NOW()
         WHERE id = $1 AND is_active = true
         RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      res.json({ message: 'Transfer deleted successfully' });
    } catch (error) {
      console.error('Error deleting transfer:', error);
      res.status(500).json({ error: 'Failed to delete transfer' });
    }
  }

  /**
   * Get transfer statistics
   */
  static async getStats(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_transfers,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transfers,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transfers,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_transfers,
          SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END) as total_quantity_transferred,
          COUNT(DISTINCT from_branch_id) as branches_sending,
          COUNT(DISTINCT to_branch_id) as branches_receiving
        FROM transfer
        WHERE is_active = true
      `;

      const result = await db.query(query);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching transfer stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Get pending transfers (requires action)
   */
  static async getPending(req, res) {
    try {
      const query = `
        SELECT 
          t.id,
          t.from_branch_id,
          fb.branch_name as from_branch,
          t.to_branch_id,
          tb.branch_name as to_branch,
          t.entry_template_id,
          et.name as template_name,
          item.item_name,
          t.quantity,
          t.transfer_date,
          t.created_at
        FROM transfer t
        JOIN branch fb ON t.from_branch_id = fb.id
        JOIN branch tb ON t.to_branch_id = tb.id
        JOIN entry_template et ON t.entry_template_id = et.id
        JOIN item ON et.item_id = item.id
        WHERE t.status = 'pending' AND t.is_active = true
        ORDER BY t.transfer_date ASC
      `;

      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      res.status(500).json({ error: 'Failed to fetch pending transfers' });
    }
  }
}

module.exports = TransferController;
