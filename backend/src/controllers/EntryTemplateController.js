// Entry Template Controller - Phase 4: Product Variants Management
const { query } = require('../utils/db');
const crypto = require('crypto');

/**
 * Create new entry template (product variant)
 * POST /api/entry-templates
 */
exports.createTemplate = async (req, res) => {
  try {
    const { item_id, template_name, specifications, unit_price, sku } = req.body;

    // Validation
    if (!item_id || !template_name || unit_price === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_REQUIRED_FIELDS',
        required: ['item_id', 'template_name', 'unit_price']
      });
    }

    if (template_name.length < 2 || template_name.length > 255) {
      return res.status(400).json({
        error: 'Template name must be 2-255 characters',
        code: 'INVALID_TEMPLATE_NAME'
      });
    }

    // Verify item exists
    const itemResult = await query('SELECT id, name FROM Item WHERE id = $1 AND is_active = true', [item_id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      });
    }

    const item = itemResult.rows[0];

    // Check SKU uniqueness if provided
    let finalSku = sku;
    if (!finalSku) {
      // Auto-generate SKU from item SKU + specs hash
      const itemSkuResult = await query('SELECT unique_id FROM Item WHERE id = $1', [item_id]);
      const itemSku = itemSkuResult.rows[0].unique_id;
      const specsHash = crypto.createHash('md5').update(JSON.stringify(specifications || {})).digest('hex').substring(0, 4).toUpperCase();
      finalSku = `${itemSku}-${specsHash}`;
    }

    // Verify SKU uniqueness
    const skuCheckResult = await query('SELECT id FROM EntryTemplate WHERE sku = $1', [finalSku]);
    if (skuCheckResult.rows.length > 0) {
      return res.status(409).json({
        error: 'SKU already exists',
        code: 'DUPLICATE_SKU'
      });
    }

    // Create template
    const result = await query(
      `INSERT INTO EntryTemplate (item_id, template_name, specifications, unit_price, sku, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [item_id, template_name, JSON.stringify(specifications || {}), unit_price, finalSku]
    );

    const template = result.rows[0];
    template.specifications = typeof template.specifications === 'string' ? JSON.parse(template.specifications) : template.specifications;
    template.item = item;

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      error: 'Failed to create template',
      code: 'CREATE_FAILED'
    });
  }
};

/**
 * Get all templates with pagination
 * GET /api/entry-templates?page=1&limit=20
 */
exports.getAllTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get count
    const countResult = await query('SELECT COUNT(*) as total FROM EntryTemplate WHERE is_active = true');
    const total = parseInt(countResult.rows[0].total);

    // Get templates with item details
    const result = await query(
      `SELECT et.*, i.name as item_name, i.unique_id as item_sku
       FROM EntryTemplate et
       JOIN Item i ON et.item_id = i.id
       WHERE et.is_active = true
       ORDER BY et.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const templates = result.rows.map(t => ({
      ...t,
      specifications: typeof t.specifications === 'string' ? JSON.parse(t.specifications) : t.specifications
    }));

    res.json({
      data: templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
      code: 'FETCH_FAILED'
    });
  }
};

/**
 * Get template by ID with statistics
 * GET /api/entry-templates/:id
 */
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT et.*, i.name as item_name, i.unique_id as item_sku
       FROM EntryTemplate et
       JOIN Item i ON et.item_id = i.id
       WHERE et.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    let template = result.rows[0];
    template.specifications = typeof template.specifications === 'string' ? JSON.parse(template.specifications) : template.specifications;

    // Get template statistics
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT i.id) as inventory_count,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        COUNT(DISTINCT ri.id) as receipts_count
       FROM EntryTemplate et
       LEFT JOIN Inventory i ON et.id = i.entry_template_id
       LEFT JOIN ReceiptItems ri ON et.id = ri.entry_template_id
       WHERE et.id = $1`,
      [id]
    );

    template.statistics = statsResult.rows[0];

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      error: 'Failed to fetch template',
      code: 'FETCH_FAILED'
    });
  }
};

/**
 * Update template
 * PUT /api/entry-templates/:id
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { template_name, specifications, unit_price, sku } = req.body;

    // Get existing template
    const existingResult = await query('SELECT * FROM EntryTemplate WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    const existing = existingResult.rows[0];

    // Validate updated fields
    const finalName = template_name || existing.template_name;
    const finalSpecs = specifications !== undefined ? specifications : existing.specifications;
    const finalPrice = unit_price !== undefined ? unit_price : existing.unit_price;
    const finalSku = sku || existing.sku;

    if (finalName.length < 2 || finalName.length > 255) {
      return res.status(400).json({
        error: 'Template name must be 2-255 characters',
        code: 'INVALID_TEMPLATE_NAME'
      });
    }

    // Check SKU uniqueness (exclude self)
    if (sku && sku !== existing.sku) {
      const skuCheckResult = await query('SELECT id FROM EntryTemplate WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuCheckResult.rows.length > 0) {
        return res.status(409).json({
          error: 'SKU already exists',
          code: 'DUPLICATE_SKU'
        });
      }
    }

    // Update template
    const result = await query(
      `UPDATE EntryTemplate 
       SET template_name = $1, specifications = $2, unit_price = $3, sku = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [finalName, JSON.stringify(finalSpecs), finalPrice, finalSku, id]
    );

    let template = result.rows[0];
    template.specifications = typeof template.specifications === 'string' ? JSON.parse(template.specifications) : template.specifications;

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      error: 'Failed to update template',
      code: 'UPDATE_FAILED'
    });
  }
};

/**
 * Search templates by name, SKU, or item_id
 * GET /api/entry-templates/search?q=&item_id=
 */
exports.searchTemplates = async (req, res) => {
  try {
    const { q, item_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE et.is_active = true';
    const params = [];

    if (q) {
      whereClause += ` AND (et.template_name ILIKE $${params.length + 1} OR et.sku ILIKE $${params.length + 2})`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (item_id) {
      whereClause += ` AND et.item_id = $${params.length + 1}`;
      params.push(item_id);
    }

    // Get count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM EntryTemplate et ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get results
    const result = await query(
      `SELECT et.*, i.name as item_name, i.unique_id as item_sku
       FROM EntryTemplate et
       JOIN Item i ON et.item_id = i.id
       ${whereClause}
       ORDER BY et.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const templates = result.rows.map(t => ({
      ...t,
      specifications: typeof t.specifications === 'string' ? JSON.parse(t.specifications) : t.specifications
    }));

    res.json({
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      error: 'Failed to search templates',
      code: 'SEARCH_FAILED'
    });
  }
};

/**
 * Deactivate template (soft delete)
 * DELETE /api/entry-templates/:id
 */
exports.deactivateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify template exists
    const checkResult = await query('SELECT id, is_active FROM EntryTemplate WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    if (!checkResult.rows[0].is_active) {
      return res.status(400).json({
        error: 'Template is already deactivated',
        code: 'ALREADY_DEACTIVATED'
      });
    }

    // Soft delete
    await query('UPDATE EntryTemplate SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    res.json({ message: 'Template deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating template:', error);
    res.status(500).json({
      error: 'Failed to deactivate template',
      code: 'DEACTIVATE_FAILED'
    });
  }
};

/**
 * Get template statistics
 * GET /api/entry-templates/:id/stats
 */
exports.getTemplateStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify template exists
    const checkResult = await query('SELECT id FROM EntryTemplate WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }

    // Get statistics
    const result = await query(
      `SELECT 
        COUNT(DISTINCT i.id) as locations_count,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        COUNT(DISTINCT ri.id) as receipts_count,
        COALESCE(SUM(ri.subtotal), 0)::DECIMAL(12,2) as total_revenue,
        COALESCE(AVG(ri.unit_price), 0)::DECIMAL(10,2) as average_price
       FROM EntryTemplate et
       LEFT JOIN Inventory i ON et.id = i.entry_template_id
       LEFT JOIN ReceiptItems ri ON et.id = ri.entry_template_id
       WHERE et.id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({
      error: 'Failed to fetch template statistics',
      code: 'STATS_FAILED'
    });
  }
};
