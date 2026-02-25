const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Main endpoints
router.post('/', CustomerController.getOrCreateCustomer);
router.get('/', CustomerController.getAll);
router.get('/search', CustomerController.search);
router.get('/:id', CustomerController.getById);

module.exports = router;
