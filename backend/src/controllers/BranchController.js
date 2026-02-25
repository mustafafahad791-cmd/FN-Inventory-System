// BranchController - Manage branch CRUD operations
const Branch = require('../models/Branch');

class BranchController {
  // Get all branches
  static async getAll(req, res) {
    try {
      const branches = await Branch.getAll();
      return res.status(200).json({
        success: true,
        data: branches
      });
    } catch (error) {
      console.error('Get all branches error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve branches'
      });
    }
  }

  // Get branch by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const branch = await Branch.getById(id);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: branch
      });
    } catch (error) {
      console.error('Get branch by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve branch'
      });
    }
  }

  // Create new branch
  static async create(req, res) {
    try {
      const { name, location, phone, email } = req.body;

      // Validation
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Branch name and location are required'
        });
      }

      const branch = await Branch.create(name, location, phone, email);

      return res.status(201).json({
        success: true,
        message: 'Branch created successfully',
        data: branch
      });
    } catch (error) {
      console.error('Create branch error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create branch'
      });
    }
  }

  // Update branch
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, location, phone, email } = req.body;

      // Validation
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Branch name and location are required'
        });
      }

      const branch = await Branch.update(id, { name, location, phone, email });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Branch updated successfully',
        data: branch
      });
    } catch (error) {
      console.error('Update branch error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update branch'
      });
    }
  }

  // Deactivate branch (soft delete)
  static async deactivate(req, res) {
    try {
      const { id } = req.params;
      const branch = await Branch.deactivate(id);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Branch deactivated successfully',
        data: branch
      });
    } catch (error) {
      console.error('Deactivate branch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate branch'
      });
    }
  }

  // Search branches
  static async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const branches = await Branch.search(q);

      return res.status(200).json({
        success: true,
        data: branches
      });
    } catch (error) {
      console.error('Search branches error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search branches'
      });
    }
  }

  // Get branch statistics
  static async getStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await Branch.getStats(id);

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get branch stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve branch statistics'
      });
    }
  }
}

module.exports = BranchController;
