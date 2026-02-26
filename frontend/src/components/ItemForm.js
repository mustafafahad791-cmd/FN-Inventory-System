import React, { useState, useEffect } from 'react';
import '../styles/ItemManagement.css';

const ItemForm = ({ item, isOpen, onClose, onSave, onError, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    unique_id: '',
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        unique_id: item.unique_id || '',
        category: item.category || '',
        description: item.description || '',
      });
      setError('');
      setValidationErrors({});
    } else if (isOpen) {
      setFormData({
        name: '',
        unique_id: '',
        category: '',
        description: '',
      });
      setError('');
      setValidationErrors({});
    }
  }, [item, isOpen]);

  const generateSKU = () => {
    if (formData.name.trim()) {
      const namePrefix = formData.name
        .trim()
        .substring(0, 3)
        .toUpperCase()
        .replace(/\s/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const sku = `${namePrefix}-${timestamp}`;
      setFormData((prev) => ({
        ...prev,
        unique_id: sku,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Item name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Item name must be at least 2 characters';
    }

    if (!formData.unique_id || formData.unique_id.trim() === '') {
      errors.unique_id = 'SKU is required';
    } else if (formData.unique_id.trim().length < 2) {
      errors.unique_id = 'SKU must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = {
        name: formData.name.trim(),
        unique_id: formData.unique_id.trim(),
        category: formData.category.trim() || null,
        description: formData.description.trim() || null,
      };

      await onSave(submitData, item?.id);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save item';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Create New Item'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Wooden Chair"
              disabled={loading}
            />
            {validationErrors.name && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="unique_id">SKU (Stock Keeping Unit) *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                id="unique_id"
                name="unique_id"
                value={formData.unique_id}
                onChange={handleChange}
                placeholder="e.g., CHAIR-0001"
                disabled={loading}
              />
              <button
                type="button"
                className="btn-generate-sku"
                onClick={generateSKU}
                disabled={loading || !formData.name}
                title="Auto-generate SKU from name"
              >
                Generate
              </button>
            </div>
            {validationErrors.unique_id && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.unique_id}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Seating, Tables, Beds..."
              disabled={loading}
              list="categoryList"
            />
            <datalist id="categoryList">
              {categories && categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {validationErrors.category && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., High-quality wooden dining chair with cushioned seat"
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
