import React, { useState, useEffect } from 'react';
import crypto from 'crypto-js';

const EntryTemplateForm = ({ template, isOpen, onClose, onSave, items }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    template_name: '',
    sku: '',
    specifications: {},
    unit_price: ''
  });
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        item_id: template.item_id,
        template_name: template.template_name,
        sku: template.sku || '',
        specifications: typeof template.specifications === 'string' 
          ? JSON.parse(template.specifications) 
          : template.specifications || {},
        unit_price: template.unit_price || ''
      });
    } else {
      setFormData({
        item_id: '',
        template_name: '',
        sku: '',
        specifications: {},
        unit_price: ''
      });
    }
    setSpecKey('');
    setSpecValue('');
    setErrors({});
  }, [template]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Auto-generate SKU from item SKU + specs
  const generateSKU = () => {
    const selectedItem = items.find(i => i.id === formData.item_id);
    if (!selectedItem) return;

    const itemSku = selectedItem.unique_id || 'ITEM';
    const specsHash = Object.values(formData.specifications)
      .join('-')
      .substring(0, 4)
      .toUpperCase();
    
    const newSku = specsHash 
      ? `${itemSku}-${specsHash}`
      : `${itemSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    setFormData(prev => ({
      ...prev,
      sku: newSku
    }));
  };

  const handleAddSpec = () => {
    if (!specKey.trim()) {
      setErrors(prev => ({
        ...prev,
        specKey: 'Specification key is required'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specKey]: specValue
      }
    }));
    setSpecKey('');
    setSpecValue('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.specKey;
      return newErrors;
    });
  };

  const handleRemoveSpec = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.item_id) newErrors.item_id = 'Item is required';
    if (!formData.template_name.trim()) newErrors.template_name = 'Template name is required';
    if (formData.template_name.length < 2 || formData.template_name.length > 255) {
      newErrors.template_name = 'Template name must be 2-255 characters';
    }
    if (formData.unit_price && isNaN(parseFloat(formData.unit_price))) {
      newErrors.unit_price = 'Unit price must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        item_id: formData.item_id,
        template_name: formData.template_name,
        sku: formData.sku || undefined,
        specifications: formData.specifications,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null
      };

      await onSave(payload);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template ? '✏️ Edit Template' : '➕ Create Template'}</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="entry-template-form">
          {/* Item Selection */}
          <div className="form-group">
            <label htmlFor="item_id">Item *</label>
            <select
              id="item_id"
              name="item_id"
              value={formData.item_id}
              onChange={handleFieldChange}
              disabled={loading || !!template}
              className={errors.item_id ? 'error' : ''}
            >
              <option value="">Select an item...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category || 'No category'})
                </option>
              ))}
            </select>
            {errors.item_id && <span className="error-text">{errors.item_id}</span>}
          </div>

          {/* Template Name */}
          <div className="form-group">
            <label htmlFor="template_name">Template Name *</label>
            <input
              id="template_name"
              type="text"
              name="template_name"
              value={formData.template_name}
              onChange={handleFieldChange}
              placeholder="e.g., Leather - Large - Red"
              disabled={loading}
              className={errors.template_name ? 'error' : ''}
            />
            {errors.template_name && <span className="error-text">{errors.template_name}</span>}
          </div>

          {/* SKU */}
          <div className="form-group">
            <label htmlFor="sku">SKU</label>
            <div className="sku-input-group">
              <input
                id="sku"
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleFieldChange}
                placeholder="Auto-generated or manual"
                disabled={loading}
              />
              <button
                type="button"
                onClick={generateSKU}
                disabled={loading || !formData.item_id}
                className="btn btn-generate-sku"
                title="Auto-generate SKU from item and specifications"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Unit Price */}
          <div className="form-group">
            <label htmlFor="unit_price">Unit Price</label>
            <input
              id="unit_price"
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleFieldChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={loading}
              className={errors.unit_price ? 'error' : ''}
            />
            {errors.unit_price && <span className="error-text">{errors.unit_price}</span>}
          </div>

          {/* Specifications */}
          <div className="form-group">
            <label>Specifications</label>
            <div className="specs-input-group">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="e.g., Material, Size, Color"
                disabled={loading}
                className="spec-key-input"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="e.g., Leather, Large, Red"
                disabled={loading}
                className="spec-value-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSpec}
                disabled={loading}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            {errors.specKey && <span className="error-text">{errors.specKey}</span>}

            {/* Display Specifications */}
            {Object.keys(formData.specifications).length > 0 && (
              <div className="specs-list">
                <h5>Added Specifications:</h5>
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span><strong>{key}:</strong> {value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(key)}
                      disabled={loading}
                      className="btn-remove"
                      title="Remove specification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '⏳ Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryTemplateForm;
