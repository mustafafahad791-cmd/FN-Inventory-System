// Item Routes - Item Management API Endpoints
const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const { authenticateToken } = require('../middleware/auth');

// All item endpoints require authentication
router.use(authenticateToken);

/**
 * GET /api/items
 * Get all active items with pagination
 */
router.get('/', ItemController.getAllItems);

/**
 * GET /api/items/search?q=query&category=category
 * Search items by name, SKU, or category
 * Must be before /:id route
 */
router.get('/search', ItemController.searchItems);

/**
 * GET /api/items/:id
 * Get single item by ID with statistics
 */
router.get('/:id', ItemController.getItemById);

/**
 * GET /api/items/:id/stats
 * Get statistics for specific item
 * Must be before /:id route
 */
router.get('/:id/stats', ItemController.getItemStats);

/**
 * POST /api/items
 * Create a new item (master product)
 * Body: { name, unique_id, category, description }
 */
router.post('/', ItemController.createItem);

/**
 * PUT /api/items/:id
 * Update an item
 * Body: { name, unique_id, category, description }
 */
router.put('/:id', ItemController.updateItem);

/**
 * DELETE /api/items/:id
 * Deactivate (soft delete) an item
 */
router.delete('/:id', ItemController.deactivateItem);

module.exports = router;
