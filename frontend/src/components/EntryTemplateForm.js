import React, { useState, useEffect } from 'react';

const EntryTemplateForm = ({ template, isOpen, onClose, onSave, items }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    name: '',
    specifications: {},
    unitPrice: ''
  });
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        itemId: template.item_id,
        name: template.name,
        specifications: typeof template.specifications === 'string' 
          ? JSON.parse(template.specifications) 
          : template.specifications || {},
        unitPrice: template.unit_price || ''
      });
    } else {
      setFormData({
        itemId: '',
        name: '',
        specifications: {},
        unitPrice: ''
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
    if (!formData.itemId) newErrors.itemId = 'Item is required';
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        itemId: formData.itemId,
        name: formData.name,
        specifications: formData.specifications,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="entry-template-form">
          {/* Item Selection */}
          <div className="form-group">
            <label htmlFor="itemId">Item *</label>
            <select
              id="itemId"
              name="itemId"
              value={formData.itemId}
              onChange={handleFieldChange}
              disabled={loading}
              className={errors.itemId ? 'error' : ''}
            >
              <option value="">Select an item...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
            {errors.itemId && <span className="error-text">{errors.itemId}</span>}
          </div>

          {/* Template Name */}
          <div className="form-group">
            <label htmlFor="name">Template Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFieldChange}
              placeholder="e.g., Premium Package, Standard Size"
              disabled={loading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Unit Price */}
          <div className="form-group">
            <label htmlFor="unitPrice">Unit Price</label>
            <input
              id="unitPrice"
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleFieldChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          {/* Specifications */}
          <div className="form-group">
            <label>Specifications</label>
            <div className="specs-input-group">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="e.g., Color, Size, Material"
                disabled={loading}
                className="spec-key-input"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="e.g., Red, Large, Leather"
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
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span><strong>{key}:</strong> {value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(key)}
                      disabled={loading}
                      className="btn-remove"
                    >
                      ×
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
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryTemplateForm;
