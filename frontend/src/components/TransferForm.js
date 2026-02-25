import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/api';

const TransferForm = ({ branches, templates, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fromBranchId: '',
    toBranchId: '',
    entryTemplateId: '',
    quantity: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(null);

  // Check available quantity when branch/template changes
  useEffect(() => {
    const checkQuantity = async () => {
      if (formData.fromBranchId && formData.entryTemplateId) {
        try {
          const inventory = await inventoryService.getByBranch(formData.fromBranchId);
          const match = inventory.find(i => i.entry_template_id === formData.entryTemplateId);
          setAvailableQuantity(match ? match.quantity_in_stock : 0);
        } catch (err) {
          console.error('Error checking quantity:', err);
        }
      }
    };

    checkQuantity();
  }, [formData.fromBranchId, formData.entryTemplateId]);

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromBranchId) {
      newErrors.fromBranchId = 'Source branch is required';
    }

    if (!formData.toBranchId) {
      newErrors.toBranchId = 'Destination branch is required';
    }

    if (formData.fromBranchId === formData.toBranchId) {
      newErrors.toBranchId = 'Cannot transfer to the same branch';
    }

    if (!formData.entryTemplateId) {
      newErrors.entryTemplateId = 'Item/template is required';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else if (availableQuantity !== null && parseInt(formData.quantity) > availableQuantity) {
      newErrors.quantity = `Insufficient stock. Available: ${availableQuantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSave({
        fromBranchId: formData.fromBranchId,
        toBranchId: formData.toBranchId,
        entryTemplateId: formData.entryTemplateId,
        quantity: parseInt(formData.quantity),
        notes: formData.notes || null
      });
      
      setFormData({
        fromBranchId: '',
        toBranchId: '',
        entryTemplateId: '',
        quantity: '',
        notes: ''
      });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedFromBranch = branches.find(b => b.id === formData.fromBranchId);
  const selectedToBranch = branches.find(b => b.id === formData.toBranchId);
  const selectedTemplate = templates.find(t => t.id === formData.entryTemplateId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Transfer</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          {/* From Branch */}
          <div className="form-group">
            <label>From Branch *</label>
            <select
              name="fromBranchId"
              value={formData.fromBranchId}
              onChange={handleChange}
              className={errors.fromBranchId ? 'error' : ''}
            >
              <option value="">Select source branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
            {errors.fromBranchId && <span className="error-text">{errors.fromBranchId}</span>}
          </div>

          {/* To Branch */}
          <div className="form-group">
            <label>To Branch *</label>
            <select
              name="toBranchId"
              value={formData.toBranchId}
              onChange={handleChange}
              className={errors.toBranchId ? 'error' : ''}
            >
              <option value="">Select destination branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
            {errors.toBranchId && <span className="error-text">{errors.toBranchId}</span>}
          </div>

          {/* Item/Template */}
          <div className="form-group">
            <label>Item/Template *</label>
            <select
              name="entryTemplateId"
              value={formData.entryTemplateId}
              onChange={handleChange}
              className={errors.entryTemplateId ? 'error' : ''}
            >
              <option value="">Select item/template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {errors.entryTemplateId && <span className="error-text">{errors.entryTemplateId}</span>}

            {availableQuantity !== null && (
              <small className="availability-info">
                Available in {selectedFromBranch?.branch_name}: {availableQuantity} units
              </small>
            )}
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={errors.quantity ? 'error' : ''}
              placeholder="Enter quantity to transfer"
            />
            {errors.quantity && <span className="error-text">{errors.quantity}</span>}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this transfer..."
              rows="3"
            />
          </div>

          {/* Summary */}
          {formData.fromBranchId && formData.toBranchId && formData.entryTemplateId && formData.quantity && (
            <div className="transfer-summary">
              <h4>Transfer Summary</h4>
              <p>
                <strong>From:</strong> {selectedFromBranch?.branch_name} 
                {selectedFromBranch?.location && <span> ({selectedFromBranch.location})</span>}
              </p>
              <p>
                <strong>To:</strong> {selectedToBranch?.branch_name}
                {selectedToBranch?.location && <span> ({selectedToBranch.location})</span>}
              </p>
              <p>
                <strong>Item:</strong> {selectedTemplate?.name}
              </p>
              <p>
                <strong>Unit Price:</strong> ${selectedTemplate?.unit_price?.toFixed(2) || '0.00'}
              </p>
              <p className="quantity-highlight">
                <strong>Total Value:</strong> ${(parseInt(formData.quantity) * (selectedTemplate?.unit_price || 0)).toFixed(2)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
