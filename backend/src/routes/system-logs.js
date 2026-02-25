const express = require('express');
const router = express.Router();
const SystemLogController = require('../controllers/SystemLogController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Analytics endpoints
router.get('/stats', SystemLogController.getStats);
router.get('/health-summary', SystemLogController.getHealthSummary);
router.get('/action-breakdown', SystemLogController.getActionBreakdown);
router.get('/entity-breakdown', SystemLogController.getEntityBreakdown);
router.get('/errors', SystemLogController.getErrors);
router.get('/date-range', SystemLogController.getByDateRange);

// Main endpoints
router.get('/', SystemLogController.getAll);
router.post('/', SystemLogController.logAction);

// Specific queries
router.get('/entity/:entityId', SystemLogController.getByEntity);
router.get('/user/:userId', SystemLogController.getByUser);
router.get('/branch/:branchId', SystemLogController.getByBranch);

module.exports = router;
