const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Main analytics endpoints
router.get('/dashboard', AnalyticsController.getDashboardAnalytics);
router.get('/sales-report', AnalyticsController.getSalesReport);
router.get('/inventory-report', AnalyticsController.getInventoryReport);
router.get('/product-performance', AnalyticsController.getProductPerformance);
router.get('/customer-segmentation', AnalyticsController.getCustomerSegmentation);
router.get('/transfer-analytics', AnalyticsController.getTransferAnalytics);
router.get('/kpis', AnalyticsController.getKPIs);

module.exports = router;
