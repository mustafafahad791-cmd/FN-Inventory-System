import React, { useState, useEffect } from 'react';
import { entryTemplateService, itemService } from '../services/api';
import EntryTemplateForm from '../components/EntryTemplateForm';
import '../styles/EntryTemplateManagement.css';

const EntryTemplateListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch all templates and items
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templatesRes, itemsRes, statsRes] = await Promise.all([
        entryTemplateService.getAll(),
        itemService.getItems(),
        entryTemplateService.getStats()
      ]);

      setTemplates(templatesRes.data);
      setFilteredTemplates(templatesRes.data);
      setItems(itemsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load entry templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = templates.filter(template =>
      template.name.toLowerCase().includes(term) ||
      template.item?.name.toLowerCase().includes(term) ||
      template.item?.category.toLowerCase().includes(term)
    );

    setFilteredTemplates(filtered);
  };

  // Handle item filter
  const handleItemFilter = (e) => {
    const itemId = e.target.value;
    setSelectedItem(itemId || null);

    if (!itemId) {
      setFilteredTemplates(templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm)
      ));
    } else {
      setFilteredTemplates(templates.filter(t =>
        t.item_id === itemId && t.name.toLowerCase().includes(searchTerm)
      ));
    }
  };

  // Open create form
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  // Open edit form
  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
  };

  // Handle save
  const handleSave = async (formData) => {
    try {
      if (formMode === 'create') {
        const response = await entryTemplateService.create(formData);
        setTemplates([...templates, response.data]);
        setFilteredTemplates([...filteredTemplates, response.data]);
      } else {
        const response = await entryTemplateService.update(selectedTemplate.id, formData);
        const updated = templates.map(t => 
          t.id === selectedTemplate.id ? response.data : t
        );
        setTemplates(updated);
        setFilteredTemplates(updated);
      }
      
      // Refresh stats
      const statsRes = await entryTemplateService.getStats();
      setStats(statsRes.data);
      
      handleCloseForm();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.error || 'Failed to save template');
    }
  };

  // Handle delete
  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to deactivate this template?')) {
      return;
    }

    try {
      await entryTemplateService.delete(templateId);
      const updated = templates.filter(t => t.id !== templateId);
      setTemplates(updated);
      setFilteredTemplates(updated);
      
      // Refresh stats
      const statsRes = await entryTemplateService.getStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  return (
    <div className="entry-template-container">
      <div className="entry-template-header">
        <h1>Entry Templates</h1>
        <p>Create templates for items with pre-defined specifications and pricing</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Templates</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">${stats.averagePrice}</div>
            <div className="stat-label">Avg. Price</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">${stats.priceRange.min}-${stats.priceRange.max}</div>
            <div className="stat-label">Price Range</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <input
          type="text"
          placeholder="Search templates or items..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        
        <select 
          value={selectedItem || ''} 
          onChange={handleItemFilter}
          className="filter-select"
        >
          <option value="">All Items</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.category})
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleCreateNew}>
          ➕ Add Template
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No templates found</h3>
          <p>Create your first entry template to get started</p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Template
          </button>
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h3>{template.name}</h3>
                <span className="template-id">{template.id.slice(0, 8)}</span>
              </div>

              {template.item && (
                <div className="template-item">
                  <strong>{template.item.name}</strong>
                  <span className="item-category">{template.item.category}</span>
                </div>
              )}

              {template.unit_price && (
                <div className="template-price">
                  <span>Unit Price:</span>
                  <span className="price">${parseFloat(template.unit_price).toFixed(2)}</span>
                </div>
              )}

              {template.specifications && Object.keys(template.specifications).length > 0 && (
                <div className="template-specs">
                  <h5>Specifications:</h5>
                  <ul>
                    {Object.entries(template.specifications).slice(0, 3).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                  {Object.keys(template.specifications).length > 3 && (
                    <div className="specs-more">+{Object.keys(template.specifications).length - 3} more</div>
                  )}
                </div>
              )}

              <div className="template-date">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </div>

              <div className="template-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleEdit(template)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(template.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <EntryTemplateForm
        template={selectedTemplate}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        items={items}
      />
    </div>
  );
};

export default EntryTemplateListPage;
