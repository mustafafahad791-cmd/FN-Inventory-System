// Entry Template Controller
const EntryTemplate = require('../models/EntryTemplate');
const Item = require('../models/Item');

class EntryTemplateController {
  // Get all templates with item details
  static async getAll(req, res) {
    try {
      const templates = await EntryTemplate.findAll();
      const templatesWithItems = await Promise.all(
        templates.map(async (template) => {
          const item = await Item.findById(template.item_id);
          return {
            ...template,
            item: item || null,
            specifications: typeof template.specifications === 'string' 
              ? JSON.parse(template.specifications) 
              : template.specifications
          };
        })
      );
      res.json(templatesWithItems);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  // Get template by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const template = await EntryTemplate.findById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const item = await Item.findById(template.item_id);
      const response = {
        ...template,
        item: item || null,
        specifications: typeof template.specifications === 'string' 
          ? JSON.parse(template.specifications) 
          : template.specifications
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  }

  // Get templates by item ID
  static async getByItemId(req, res) {
    try {
      const { itemId } = req.params;

      // Verify item exists
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const templates = await EntryTemplate.findByItemId(itemId);
      const templatesWithSpecs = templates.map(template => ({
        ...template,
        specifications: typeof template.specifications === 'string' 
          ? JSON.parse(template.specifications) 
          : template.specifications
      }));

      res.json(templatesWithSpecs);
    } catch (error) {
      console.error('Error fetching templates by item:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  // Create new template
  static async create(req, res) {
    try {
      const { itemId, name, specifications, unitPrice } = req.body;

      // Validation
      if (!itemId || !name) {
        return res.status(400).json({ error: 'Item ID and name are required' });
      }

      // Verify item exists
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Create template
      const template = await EntryTemplate.create(
        itemId,
        name,
        specifications || {},
        unitPrice || null
      );

      const response = {
        ...template,
        item: item,
        specifications: typeof template.specifications === 'string' 
          ? JSON.parse(template.specifications) 
          : template.specifications
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  // Update template
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, specifications, unitPrice } = req.body;

      // Get existing template
      const template = await EntryTemplate.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Update template
      const updatedTemplate = await EntryTemplate.update(
        id,
        name || template.name,
        specifications !== undefined ? specifications : template.specifications,
        unitPrice !== undefined ? unitPrice : template.unit_price
      );

      const item = await Item.findById(updatedTemplate.item_id);
      const response = {
        ...updatedTemplate,
        item: item || null,
        specifications: typeof updatedTemplate.specifications === 'string' 
          ? JSON.parse(updatedTemplate.specifications) 
          : updatedTemplate.specifications
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  // Delete template (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verify template exists
      const template = await EntryTemplate.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Soft delete
      await EntryTemplate.delete(id);
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  // Get stats
  static async getStats(req, res) {
    try {
      const templates = await EntryTemplate.findAll();
      const stats = {
        total: templates.length,
        averagePrice: templates.length > 0 
          ? (templates.reduce((sum, t) => sum + (parseFloat(t.unit_price) || 0), 0) / templates.length).toFixed(2)
          : 0,
        priceRange: templates.length > 0 ? {
          min: Math.min(...templates.map(t => parseFloat(t.unit_price) || 0)),
          max: Math.max(...templates.map(t => parseFloat(t.unit_price) || 0))
        } : { min: 0, max: 0 }
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

module.exports = EntryTemplateController;
