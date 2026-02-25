// AuthController
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, email, password, confirmPassword, fullName } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      // Create user
      const user = await User.create(username, email, password, fullName);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate token
      const token = generateToken(user.id);

      // Return token and user info
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Verify token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }

  // Logout (client-side, but we keep it for consistency)
  static async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please clear token from client storage.'
    });
  }

  // Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { email, fullName } = req.body;
      const userId = req.user.userId;

      const updatedUser = await User.updateUser(userId, { email, fullName });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }
}

module.exports = AuthController;
