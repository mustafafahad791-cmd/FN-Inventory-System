const express = require('express');
const router = express.Router();
const CustomerLogController = require('../controllers/CustomerLogController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Analytics and insights endpoints
router.get('/top', CustomerLogController.getTopCustomers);
router.get('/repeat', CustomerLogController.getRepeatCustomers);
router.get('/acquisition-trends', CustomerLogController.getAcquisitionTrends);
router.get('/search', CustomerLogController.search);

// Main CRUD endpoints
router.get('/', CustomerLogController.getAll);

// Customer specific
router.get('/:customerId', CustomerLogController.getPurchaseHistory);
router.get('/:customerId/trends', CustomerLogController.getPurchaseTrends);
router.get('/:customerId/preferences', CustomerLogController.getCustomerPreferences);

module.exports = router;
