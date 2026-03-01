// Entry Template Routes - Phase 4: Product Variants Management
const express = require('express');
const router = express.Router();
const EntryTemplateController = require('../controllers/EntryTemplateController');
const { authenticateToken } = require('../middleware/auth');

// All routes require JWT authentication
router.use(authenticateToken);

/**
 * GET /api/entry-templates
 * Get all active templates with pagination
 * Query params: page=1, limit=20
 */
router.get('/', EntryTemplateController.getAllTemplates);

/**
 * POST /api/entry-templates
 * Create new template
 * Body: { item_id, template_name, specifications, unit_price, [sku] }
 */
router.post('/', EntryTemplateController.createTemplate);

/**
 * GET /api/entry-templates/search
 * Search templates by name, SKU, or item_id
 * Query params: q=search_term, item_id=uuid, page=1, limit=20
 */
router.get('/search', EntryTemplateController.searchTemplates);

/**
 * GET /api/entry-templates/:id
 * Get single template with statistics
 */
router.get('/:id', EntryTemplateController.getTemplateById);

/**
 * PUT /api/entry-templates/:id
 * Update template
 * Body: { [template_name], [specifications], [unit_price], [sku] }
 */
router.put('/:id', EntryTemplateController.updateTemplate);

/**
 * DELETE /api/entry-templates/:id
 * Deactivate template (soft delete)
 */
router.delete('/:id', EntryTemplateController.deactivateTemplate);

/**
 * GET /api/entry-templates/:id/stats
 * Get template usage statistics
 */
router.get('/:id/stats', EntryTemplateController.getTemplateStats);

module.exports = router;
