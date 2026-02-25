import React, { useState, useEffect } from 'react';
import apiServices from '../services/api';
import ReceiptForm from '../components/ReceiptForm';
import '../styles/ReceiptManagement.css';

const ReceiptListPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever data changes
  useEffect(() => {
    applyFilters();
  }, [receipts, searchTerm, selectedBranch, dateFrom, dateTo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [receiptsData, branchesData, templatesData, statsData] = await Promise.all([
        apiServices.receiptService.getAll(),
        apiServices.branchService.getBranches(),
        apiServices.entryTemplateService.getAll(),
        apiServices.receiptService.getStats()
      ]);

      setReceipts(receiptsData || []);
      setBranches(branchesData || []);
      setTemplates(templatesData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    // Branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(r => r.branch_id === selectedBranch);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(r => new Date(r.receipt_timestamp) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.receipt_timestamp) <= endDate);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.receipt_id.toLowerCase().includes(term) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(term)) ||
        (r.customer_phone && r.customer_phone.includes(term))
      );
    }

    setFilteredReceipts(filtered);
  };

  const handleCreateNew = () => {
    setSelectedReceipt(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReceipt(null);
  };

  const handleReceiptSave = async () => {
    await fetchData();
    handleFormClose();
  };

  const handleViewReceipt = async (receiptId) => {
    try {
      const receipt = await apiServices.receiptService.getById(receiptId);
      setSelectedReceipt(receipt);
    } catch (err) {
      console.error('Error fetching receipt details:', err);
      alert('Failed to load receipt details');
    }
  };

  const handleDownloadPDF = (receipt) => {
    // Generate receipt PDF
    const content = generateReceiptPDF(receipt);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `Receipt-${receipt.receipt_id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateReceiptPDF = (receipt) => {
    let content = '\n========================================\n';
    content += '          FN FURNITURE STORE\n';
    content += '========================================\n\n';
    content += `Receipt #: ${receipt.receipt_id}\n`;
    content += `Date: ${new Date(receipt.receipt_timestamp).toLocaleString()}\n`;
    content += `Branch: ${receipt.branch_name}\n\n`;
    
    if (receipt.customer_name) {
      content += `Customer: ${receipt.customer_name}\n`;
      if (receipt.customer_phone) {
        content += `Phone: ${receipt.customer_phone}\n`;
      }
      content += '\n';
    }

    content += '----------------------------------------\n';
    content += 'ITEMS\n';
    content += '----------------------------------------\n';

    if (receipt.items && receipt.items.length > 0) {
      receipt.items.forEach(item => {
        content += `${item.item_name} - ${item.template_name}\n`;
        content += `  Qty: ${item.quantity} x Rs. ${item.unit_price.toFixed(2)} = Rs. ${item.subtotal.toFixed(2)}\n`;
      });
    }

    content += '----------------------------------------\n';
    content += `TOTAL: Rs. ${receipt.total_price.toFixed(2)}\n`;
    content += '----------------------------------------\n\n';
    content += 'Thank you for your purchase!\n';
    content += '========================================\n';

    return content;
  };

  if (loading) {
    return <div className="loading">Loading receipts...</div>;
  }

  return (
    <div className="receipt-management">
      <div className="receipt-header">
        <h1>E-Receipts Management</h1>
        <button className="btn-primary" onClick={handleCreateNew}>+ New Receipt</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="receipt-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_receipts}</div>
            <div className="stat-label">Total Receipts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unique_customers}</div>
            <div className="stat-label">Unique Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Rs. {stats.total_sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Sales</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Rs. {stats.avg_receipt_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-label">Avg Receipt</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="receipt-controls">
        <input
          type="text"
          placeholder="Search receipt ID, customer name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="filter-input"
          placeholder="From Date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="filter-input"
          placeholder="To Date"
        />
      </div>

      {/* Receipts Table */}
      <div className="receipt-table-container">
        {filteredReceipts.length === 0 ? (
          <div className="empty-state">
            <p>No receipts found</p>
          </div>
        ) : (
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Branch</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(receipt => (
                <tr key={receipt.id}>
                  <td><strong>{receipt.receipt_id}</strong></td>
                  <td>{receipt.branch_name}</td>
                  <td>{receipt.customer_name || 'Walk-in Customer'}</td>
                  <td>{receipt.item_count} items</td>
                  <td>Rs. {receipt.total_price.toFixed(2)}</td>
                  <td>{new Date(receipt.receipt_timestamp).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewReceipt(receipt.id)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-action btn-download"
                      onClick={() => handleDownloadPDF(receipt)}
                      title="Download Receipt"
                    >
                      📥
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Receipt Form Modal */}
      {isFormOpen && (
        <ReceiptForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleReceiptSave}
          branches={branches}
          templates={templates}
        />
      )}

      {/* Receipt Details Modal */}
      {selectedReceipt && !isFormOpen && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content receipt-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Receipt Details</h2>
              <button className="modal-close" onClick={() => setSelectedReceipt(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-details-grid">
                <div>
                  <label>Receipt ID:</label>
                  <p>{selectedReceipt.receipt_id}</p>
                </div>
                <div>
                  <label>Branch:</label>
                  <p>{selectedReceipt.branch_name} ({selectedReceipt.branch_location})</p>
                </div>
                <div>
                  <label>Customer:</label>
                  <p>{selectedReceipt.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <label>Date:</label>
                  <p>{new Date(selectedReceipt.receipt_timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="receipt-items-section">
                <h3>Items</h3>
                <table className="receipt-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Variant</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items && selectedReceipt.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.item_name}</td>
                        <td>{item.template_name}</td>
                        <td>Rs. {item.unit_price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-total-section">
                <h3>Total: Rs. {selectedReceipt.total_price.toFixed(2)}</h3>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => handleDownloadPDF(selectedReceipt)}
                >
                  📥 Download Receipt
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptListPage;
