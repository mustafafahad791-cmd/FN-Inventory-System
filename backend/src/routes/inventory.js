const express = require('express');
const InventoryController = require('../controllers/InventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get inventory statistics
router.get('/stats', InventoryController.getStats);

// Get low stock items
router.get('/low-stock', InventoryController.getLowStock);

// Get all inventory
router.get('/', InventoryController.getAll);

// Get inventory by branch
router.get('/branch/:branchId', InventoryController.getByBranch);

// Get inventory by template
router.get('/template/:templateId', InventoryController.getByTemplate);

// Get inventory by ID
router.get('/:id', InventoryController.getById);

// Create new inventory record
router.post('/', InventoryController.create);

// Update inventory record
router.put('/:id', InventoryController.update);

// Adjust inventory quantity
router.post('/:id/adjust', InventoryController.adjust);

// Delete (soft-delete) inventory
router.delete('/:id', InventoryController.delete);

module.exports = router;
