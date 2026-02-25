import React, { useState, useEffect } from 'react';
import apiServices from '../services/api';

const ReceiptForm = ({ isOpen, onClose, onSave, branches, templates }) => {
  const [formData, setFormData] = useState({
    branchId: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    items: []
  });
  const [currentItem, setCurrentItem] = useState({
    entryTemplateId: '',
    quantity: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Calculate total value
  useEffect(() => {
    let total = 0;
    formData.items.forEach(item => {
      const template = templates.find(t => t.id === item.entryTemplateId);
      if (template) {
        total += (template.unit_price || 0) * item.quantity;
      }
    });
    setTotalValue(total);
  }, [formData.items, templates]);

  const handleBranchChange = (e) => {
    setFormData({ ...formData, branchId: e.target.value });
    setErrors({ ...errors, branchId: '' });
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTemplateChange = (e) => {
    setCurrentItem({ ...currentItem, entryTemplateId: e.target.value });
  };

  const handleQuantityChange = (e) => {
    const quantity = Math.max(1, parseInt(e.target.value) || 1);
    setCurrentItem({ ...currentItem, quantity });
  };

  const handleAddItem = () => {
    const error = {};

    if (!currentItem.entryTemplateId) {
      error.entryTemplateId = 'Please select a product';
    }

    if (currentItem.quantity < 1) {
      error.quantity = 'Quantity must be at least 1';
    }

    // Check if item already in list
    if (formData.items.some(item => item.entryTemplateId === currentItem.entryTemplateId)) {
      error.entryTemplateId = 'Item already added. Please increase quantity or remove first.';
    }

    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, currentItem]
    });
    setCurrentItem({ entryTemplateId: '', quantity: 1 });
    setErrors({});
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = {};

    if (!formData.branchId) {
      error.branchId = 'Branch is required';
    }

    if (formData.items.length === 0) {
      error.items = 'Please add at least one item';
    }

    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }

    try {
      setLoading(true);

      // Create or get customer
      let customerId = formData.customerId;
      if (formData.customerName || formData.customerPhone) {
        const customerData = await apiServices.customerService.getOrCreateCustomer({
          customerId: `CUST-${Date.now()}`,
          name: formData.customerName || null,
          phone: formData.customerPhone || null
        });
        customerId = customerData.id;
      }

      // Create receipt
      const receiptData = {
        branchId: formData.branchId,
        customerId: customerId || null,
        items: formData.items.map(item => ({
          entryTemplateId: item.entryTemplateId,
          quantity: item.quantity
        }))
      };

      await apiServices.receiptService.create(receiptData);
      alert('Receipt created successfully!');
      setFormData({ branchId: '', customerId: '', customerName: '', customerPhone: '', items: [] });
      setErrors({});
      onSave();
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert(err.response?.data?.error || 'Failed to create receipt');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content receipt-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Receipt</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="receipt-form">
          {/* Branch Selection */}
          <div className="form-section">
            <h3>Receipt Details</h3>
            <div className="form-group">
              <label>Branch *</label>
              <select
                value={formData.branchId}
                onChange={handleBranchChange}
                className={`form-input ${errors.branchId ? 'error' : ''}`}
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branchId && <span className="error-text">{errors.branchId}</span>}
            </div>
          </div>

          {/* Customer Information */}
          <div className="form-section">
            <h3>Customer Information (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleCustomerInfoChange}
                  className="form-input"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleCustomerInfoChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="form-section">
            <h3>Add Items to Receipt</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={currentItem.entryTemplateId}
                  onChange={handleTemplateChange}
                  className={`form-input ${errors.entryTemplateId ? 'error' : ''}`}
                >
                  <option value="">Select Product</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.item_name} - {template.name} (Rs. {template.unit_price?.toFixed(2)})
                    </option>
                  ))}
                </select>
                {errors.entryTemplateId && <span className="error-text">{errors.entryTemplateId}</span>}
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={currentItem.quantity}
                  onChange={handleQuantityChange}
                  className={`form-input ${errors.quantity ? 'error' : ''}`}
                  min="1"
                />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>
              <div className="form-group button-group">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddItem}
                  disabled={loading}
                >
                  Add Item
                </button>
              </div>
            </div>

            {errors.items && <span className="error-text">{errors.items}</span>}
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="form-section">
              <h3>Items in Receipt ({formData.items.length})</h3>
              <div className="receipt-items-preview">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const template = templates.find(t => t.id === item.entryTemplateId);
                      const subtotal = (template?.unit_price || 0) * item.quantity;
                      return (
                        <tr key={index}>
                          <td>{template?.item_name} - {template?.name}</td>
                          <td>Rs. {template?.unit_price?.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>Rs. {subtotal.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleRemoveItem(index)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="receipt-total-display">
                  <strong>Total: Rs. {totalValue.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Receipt'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptForm;
