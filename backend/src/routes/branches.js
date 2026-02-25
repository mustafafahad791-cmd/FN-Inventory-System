// Branch Routes
const express = require('express');
const BranchController = require('../controllers/BranchController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All branch routes require authentication
router.use(authenticateToken);

// Get all branches
router.get('/', BranchController.getAll);

// Search branches
router.get('/search', BranchController.search);

// Get branch by ID
router.get('/:id', BranchController.getById);

// Get branch statistics
router.get('/:id/stats', BranchController.getStats);

// Create new branch
router.post('/', BranchController.create);

// Update branch
router.put('/:id', BranchController.update);

// Deactivate branch (soft delete)
router.delete('/:id', BranchController.deactivate);

module.exports = router;
