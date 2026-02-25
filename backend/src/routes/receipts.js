const express = require('express');
const router = express.Router();
const ReceiptController = require('../controllers/ReceiptController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Statistics and special endpoints
router.get('/stats', ReceiptController.getStats);
router.get('/sales-report', ReceiptController.getSalesByDateRange);
router.get('/search', ReceiptController.search);

// Main CRUD endpoints
router.get('/', ReceiptController.getAll);
router.post('/', ReceiptController.create);
router.get('/:id', ReceiptController.getById);

// Branch and customer specific
router.get('/branch/:branchId', ReceiptController.getByBranch);
router.get('/customer/:customerId', ReceiptController.getByCustomer);

module.exports = router;
