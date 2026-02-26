const { query } = require('../utils/db');

/**
 * Create a new item (master product)
 */
exports.createItem = async (req, res) => {
  try {
    const { name, unique_id, category, description } = req.body;

    // Validation
    if (!name || !unique_id) {
      return res.status(400).json({
        success: false,
        error: 'Name and SKU are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Trim and validate strings
    const trimmedName = name.trim();
    const trimmedSKU = unique_id.trim();
    const trimmedCategory = category ? category.trim() : null;
    const trimmedDescription = description ? description.trim() : null;

    // Validate length
    if (trimmedName.length < 2 || trimmedName.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 255 characters',
        code: 'INVALID_NAME_LENGTH'
      });
    }

    if (trimmedSKU.length < 2 || trimmedSKU.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'SKU must be between 2 and 50 characters',
        code: 'INVALID_SKU_LENGTH'
      });
    }

    // Database insert with prepared statement
    const result = await query(
      `INSERT INTO item (name, unique_id, category, description, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, name, unique_id, category, description, is_active, created_at, updated_at`,
      [trimmedName, trimmedSKU, trimmedCategory, trimmedDescription]
    );

    if (!result.rows.length) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create item',
        code: 'CREATE_FAILED'
      });
    }

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error.message);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      const field = error.detail.includes('unique_id') ? 'SKU' : 'Name';
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
        code: 'DUPLICATE_ITEM'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create item',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Get all active items with pagination
 */
exports.getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM item WHERE is_active = true'
    );
    const total = countResult.rows[0].total;

    // Get items with pagination
    const result = await query(
      `SELECT id, name, unique_id, category, description, is_active, created_at, updated_at 
       FROM item 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching items:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch items',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Get a single item by ID
 */
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        code: 'INVALID_ID'
      });
    }

    const result = await query(
      `SELECT id, name, unique_id, category, description, is_active, created_at, updated_at 
       FROM item 
       WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }

    // Get statistics about this item
    const templatesResult = await query(
      'SELECT COUNT(*) as count FROM entrytemplate WHERE item_id = $1 AND is_active = true',
      [id]
    );

    const receiptsResult = await query(
      `SELECT COUNT(*) as count FROM receiptitems 
       WHERE entry_template_id IN (
         SELECT id FROM entrytemplate WHERE item_id = $1
       )`,
      [id]
    );

    return res.json({
      success: true,
      data: result.rows[0],
      templates: parseInt(templatesResult.rows[0].count),
      receipts: parseInt(receiptsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching item:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch item',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Update an item
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unique_id, category, description } = req.body;

    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        code: 'INVALID_ID'
      });
    }

    // Check if item exists
    const checkResult = await query(
      'SELECT id FROM item WHERE id = $1',
      [id]
    );

    if (!checkResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }

    // Prepare update fields
    const updates = [];
    const values = [id];
    let paramCount = 2;

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 255) {
        return res.status(400).json({
          success: false,
          error: 'Name must be between 2 and 255 characters',
          code: 'INVALID_NAME_LENGTH'
        });
      }
      updates.push(`name = $${paramCount}`);
      values.push(trimmedName);
      paramCount++;
    }

    if (unique_id !== undefined) {
      const trimmedSKU = unique_id.trim();
      if (trimmedSKU.length < 2 || trimmedSKU.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'SKU must be between 2 and 50 characters',
          code: 'INVALID_SKU_LENGTH'
        });
      }
      updates.push(`unique_id = $${paramCount}`);
      values.push(trimmedSKU);
      paramCount++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category ? category.trim() : null);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description ? description.trim() : null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
        code: 'NO_FIELDS_TO_UPDATE'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `UPDATE item SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, unique_id, category, description, is_active, created_at, updated_at`;

    const result = await query(sql, values);

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error.message);

    // Handle unique constraint violations
    if (error.code === '23505') {
      const field = error.detail.includes('unique_id') ? 'SKU' : 'Name';
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
        code: 'DUPLICATE_ITEM'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update item',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Search items by name, SKU, or category
 */
exports.searchItems = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        code: 'MISSING_SEARCH_QUERY'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    let sql = `SELECT id, name, unique_id, category, description, is_active, created_at, updated_at 
               FROM item 
               WHERE is_active = true AND (name ILIKE $1 OR unique_id ILIKE $1 OR category ILIKE $1)`;
    const params = [searchTerm];

    if (category) {
      sql += ` AND category = $2`;
      params.push(category);
    }

    sql += ` ORDER BY name ASC LIMIT 50`;

    const result = await query(sql, params);

    return res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error searching items:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to search items',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Deactivate (soft delete) an item
 */
exports.deactivateItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        code: 'INVALID_ID'
      });
    }

    // Check if item exists
    const checkResult = await query(
      'SELECT id, is_active FROM item WHERE id = $1',
      [id]
    );

    if (!checkResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }

    if (!checkResult.rows[0].is_active) {
      return res.status(400).json({
        success: false,
        error: 'Item is already inactive',
        code: 'ALREADY_INACTIVE'
      });
    }

    // Soft delete - set is_active to false
    const result = await query(
      `UPDATE item SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 
       RETURNING id, name, unique_id, category, description, is_active, created_at, updated_at`,
      [id]
    );

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Item deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating item:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate item',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Get statistics for an item
 */
exports.getItemStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID',
        code: 'INVALID_ID'
      });
    }

    // Check if item exists
    const checkResult = await query(
      'SELECT id, name FROM item WHERE id = $1',
      [id]
    );

    if (!checkResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }

    // Get templates using this item
    const templatesResult = await query(
      `SELECT COUNT(*) as count FROM entrytemplate 
       WHERE item_id = $1 AND is_active = true`,
      [id]
    );

    // Get receipts containing this item
    const receiptsResult = await query(
      `SELECT COUNT(*) as count FROM receiptitems 
       WHERE entry_template_id IN (
         SELECT id FROM entrytemplate WHERE item_id = $1 AND is_active = true
       )`,
      [id]
    );

    // Get total quantity sold
    const quantitySoldResult = await query(
      `SELECT COALESCE(SUM(quantity), 0) as total_quantity FROM receiptitems 
       WHERE entry_template_id IN (
         SELECT id FROM entrytemplate WHERE item_id = $1 AND is_active = true
       )`,
      [id]
    );

    // Get revenue generated
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM receiptitems 
       WHERE entry_template_id IN (
         SELECT id FROM entrytemplate WHERE item_id = $1 AND is_active = true
       )`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        item_id: id,
        item_name: checkResult.rows[0].name,
        templates_count: parseInt(templatesResult.rows[0].count),
        receipts_count: parseInt(receiptsResult.rows[0].count),
        total_quantity_sold: parseInt(quantitySoldResult.rows[0].total_quantity),
        total_revenue: parseFloat(revenueResult.rows[0].total_revenue) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching item stats:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch item statistics',
      code: 'SERVER_ERROR'
    });
  }
};
