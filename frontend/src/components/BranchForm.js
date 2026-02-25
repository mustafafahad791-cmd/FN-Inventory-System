import React, { useState, useEffect } from 'react';
import '../styles/BranchManagement.css';

const BranchForm = ({ branch, isOpen, onClose, onSave, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (branch && isOpen) {
      setFormData({
        name: branch.name || '',
        location: branch.location || '',
        phone: branch.phone || '',
        email: branch.email || '',
      });
      setError('');
      setValidationErrors({});
    } else if (isOpen) {
      setFormData({
        name: '',
        location: '',
        phone: '',
        email: '',
      });
      setError('');
      setValidationErrors({});
    }
  }, [branch, isOpen]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Branch name is required';
    }

    if (!formData.location || formData.location.trim() === '') {
      errors.location = 'Location is required';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        location: formData.location.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      await onSave(submitData, branch?.id);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save branch';
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
          <h2>{branch ? 'Edit Branch' : 'Create New Branch'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Branch Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Downtown Store"
              disabled={loading}
            />
            {validationErrors.name && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., 123 Main Street, City, State"
              disabled={loading}
            />
            {validationErrors.location && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.location}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., (555) 123-4567"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., manager@branch.com"
              disabled={loading}
            />
            {validationErrors.email && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.email}
              </span>
            )}
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
              {loading ? 'Saving...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchForm;
