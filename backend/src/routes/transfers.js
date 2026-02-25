const express = require('express');
const TransferController = require('../controllers/TransferController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get transfer statistics
router.get('/stats', TransferController.getStats);

// Get pending transfers (requires action)
router.get('/pending', TransferController.getPending);

// Get all transfers
router.get('/', TransferController.getAll);

// Get transfers from a branch
router.get('/from/:branchId', TransferController.getFromBranch);

// Get transfers to a branch
router.get('/to/:branchId', TransferController.getToBranch);

// Get transfer by ID
router.get('/:id', TransferController.getById);

// Create new transfer
router.post('/', TransferController.create);

// Confirm/complete transfer
router.post('/:id/confirm', TransferController.confirm);

// Cancel transfer
router.post('/:id/cancel', TransferController.cancel);

// Delete (soft-delete) transfer
router.delete('/:id', TransferController.delete);

module.exports = router;
