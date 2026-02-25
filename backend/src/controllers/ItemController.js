// ItemController - Item Management Business Logic
const Item = require('../models/Item');

class ItemController {
  // Get all active items with optional search
  static async getAll(req, res) {
    try {
      const items = await Item.findAll();
      res.status(200).json(items);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch items',
        error: err.message
      });
    }
  }

  // Get single item by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await Item.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.status(200).json(item);
    } catch (err) {
      console.error('Error fetching item:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch item',
        error: err.message
      });
    }
  }

  // Create new item
  static async create(req, res) {
    try {
      const { name, category, description } = req.body;

      // Validation
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Item name is required'
        });
      }

      if (!category || category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      // Check for duplicate name within category
      const duplicate = await Item.findByNameAndCategory(name.trim(), category.trim());
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Item with this name already exists in this category'
        });
      }

      const item = await Item.create(
        name.trim(),
        category.trim(),
        description ? description.trim() : null
      );

      res.status(201).json(item);
    } catch (err) {
      console.error('Error creating item:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create item',
        error: err.message
      });
    }
  }

  // Update item
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, category, description } = req.body;

      // Check if item exists
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Validation
      if (name && name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Item name cannot be empty'
        });
      }

      if (category && category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty'
        });
      }

      // Check for duplicate if name or category changed
      if ((name && name.trim() !== item.name) || (category && category.trim() !== item.category)) {
        const duplicate = await Item.findByNameAndCategory(
          name ? name.trim() : item.name,
          category ? category.trim() : item.category
        );
        if (duplicate && duplicate.id !== id) {
          return res.status(409).json({
            success: false,
            message: 'Item with this name already exists in this category'
          });
        }
      }

      const updatedItem = await Item.update(
        id,
        name ? name.trim() : item.name,
        category ? category.trim() : item.category,
        description !== undefined ? (description ? description.trim() : null) : item.description
      );

      res.status(200).json(updatedItem);
    } catch (err) {
      console.error('Error updating item:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update item',
        error: err.message
      });
    }
  }

  // Deactivate item (soft delete)
  static async deactivate(req, res) {
    try {
      const { id } = req.params;

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      await Item.deactivate(id);

      res.status(200).json({
        success: true,
        message: 'Item deactivated successfully'
      });
    } catch (err) {
      console.error('Error deactivating item:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate item',
        error: err.message
      });
    }
  }

  // Search items by name or category
  static async search(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const items = await Item.search(q.trim());
      res.status(200).json(items);
    } catch (err) {
      console.error('Error searching items:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to search items',
        error: err.message
      });
    }
  }

  // Get items by category
  static async getByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category || category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      const items = await Item.findByCategory(category.trim());
      res.status(200).json(items);
    } catch (err) {
      console.error('Error fetching items by category:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch items by category',
        error: err.message
      });
    }
  }

  // Get all categories
  static async getCategories(req, res) {
    try {
      const categories = await Item.getAllCategories();
      res.status(200).json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: err.message
      });
    }
  }

  // Get item statistics
  static async getStats(req, res) {
    try {
      const stats = await Item.getStats();
      res.status(200).json(stats);
    } catch (err) {
      console.error('Error fetching item statistics:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: err.message
      });
    }
  }
}

module.exports = ItemController;
