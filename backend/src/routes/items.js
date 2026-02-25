// Item Routes - Item Management API Endpoints
const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const { authenticateToken } = require('../middleware/auth');

// All item endpoints require authentication
router.use(authenticateToken);

// Get all items
router.get('/', ItemController.getAll);

// Get item statistics
router.get('/stats', ItemController.getStats);

// Search items by name or category
router.get('/search', ItemController.search);

// Get items by category
router.get('/category/:category', ItemController.getByCategory);

// Get all categories
router.get('/categories/all', ItemController.getCategories);

// Get single item by ID (must be after /stats and /search)
router.get('/:id', ItemController.getById);

// Create new item
router.post('/', ItemController.create);

// Update item
router.put('/:id', ItemController.update);

// Deactivate item
router.delete('/:id', ItemController.deactivate);

module.exports = router;
