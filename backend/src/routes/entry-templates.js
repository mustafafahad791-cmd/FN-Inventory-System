// Entry Template Routes
const express = require('express');
const router = express.Router();
const EntryTemplateController = require('../controllers/EntryTemplateController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get statistics
router.get('/stats', EntryTemplateController.getStats);

// Get all templates
router.get('/', EntryTemplateController.getAll);

// Get templates by item ID
router.get('/item/:itemId', EntryTemplateController.getByItemId);

// Get single template
router.get('/:id', EntryTemplateController.getById);

// Create new template
router.post('/', EntryTemplateController.create);

// Update template
router.put('/:id', EntryTemplateController.update);

// Delete template (soft delete)
router.delete('/:id', EntryTemplateController.delete);

module.exports = router;
