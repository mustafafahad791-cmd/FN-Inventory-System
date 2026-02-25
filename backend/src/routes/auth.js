// Authentication Routes
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.get('/users', authenticateToken, AuthController.getAllUsers);

module.exports = router;
