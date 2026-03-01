import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EntryTemplateForm from '../components/EntryTemplateForm';
import '../styles/EntryTemplateManagement.css';

const EntryTemplateListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Fetch templates with pagination
  const fetchTemplates = async (page = 1, itemId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm) {
        response = await api.searchTemplates(searchTerm, itemId, page);
      } else {
        response = await api.getTemplates(page);
      }

      setTemplates(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items for filter
  const fetchItems = async () => {
    try {
      const response = await api.getItems();
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };
    
    if (term || selectedItem) {
      fetchTemplates(1, selectedItem);
    } else {
      fetchTemplates(1);
    }
  };

  // Handle item filter
  const handleItemFilter = (e) => {
    const itemId = e.target.value;
    setSelectedItem(itemId || null);
    
    if (searchTerm || itemId) {
      fetchTemplates(1, itemId);
    } else {
      fetchTemplates(1);
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
        await api.createTemplate(formData);
      } else {
        await api.updateTemplate(selectedTemplate.id, formData);
      }
      
      handleCloseForm();
      fetchTemplates(pagination.page, selectedItem);
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.error || 'Failed to save template');
    }
  };

  // Handle delete/deactivate
  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to deactivate this template?')) {
      return;
    }

    try {
      await api.deactivateTemplate(templateId);
      fetchTemplates(pagination.page, selectedItem);
    } catch (err) {
      console.error('Error deactivating template:', err);
      setError(err.response?.data?.error || 'Failed to deactivate template');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchTemplates(newPage, selectedItem);
  };

  return (
    <div className="entry-template-management-container">
      <div className="entry-template-header">
        <h1>📋 Entry Templates</h1>
        <p>Create product variants with specifications and pricing</p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Controls */}
      <div className="controls-section">
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="Search by name or SKU..."
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
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleCreateNew}>
          ➕ Add Template
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No templates found</h3>
          <p>Create your first entry template to get started</p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Template
          </button>
        </div>
      ) : (
        <>
          <div className="templates-grid">
            {templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <div>
                    <h3>{template.template_name}</h3>
                    <p className="template-sku">{template.sku}</p>
                  </div>
                </div>

                {template.item_name && (
                  <div className="template-item">
                    <span className="item-label">Item:</span>
                    <strong>{template.item_name}</strong>
                  </div>
                )}

                {template.unit_price && (
                  <div className="template-price">
                    <span className="price-label">Unit Price:</span>
                    <span className="price">${parseFloat(template.unit_price).toFixed(2)}</span>
                  </div>
                )}

                {template.specifications && Object.keys(template.specifications).length > 0 && (
                  <div className="template-specs">
                    <h5>Specs:</h5>
                    <div className="specs-list">
                      {Object.entries(template.specifications).map(([key, value]) => (
                        <div key={key} className="spec-item">
                          <span className="spec-key">{key}:</span>
                          <span className="spec-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="template-date">
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </div>

                <div className="template-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleEdit(template)}
                    title="Edit template"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(template.id)}
                    title="Deactivate template"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                className="btn btn-sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                ← Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button 
                className="btn btn-sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
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
