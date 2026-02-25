import React, { useState, useEffect } from 'react';
import { transferService, branchService, entryTemplateService } from '../services/api';
import TransferForm from '../components/TransferForm';
import '../styles/TransferManagement.css';

const TransferListPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedFromBranch, setSelectedFromBranch] = useState(null);
  const [selectedToBranch, setSelectedToBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Fetch data on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transfersData, branchesData, templatesData, statsData, pendingData] = await Promise.all([
        transferService.getAll(),
        branchService.getAll(),
        entryTemplateService.getAll(),
        transferService.getStats(),
        transferService.getPending()
      ]);

      setTransfers(transfersData);
      setBranches(branchesData);
      setTemplates(templatesData);
      setStats(statsData);
      setPendingTransfers(pendingData);

      applyFilters(transfersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters(transfers);
  }, [selectedStatus, selectedFromBranch, selectedToBranch, searchTerm, transfers]);

  const applyFilters = (data) => {
    let filtered = data;

    if (selectedStatus) {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    if (selectedFromBranch) {
      filtered = filtered.filter(t => t.from_branch_id === selectedFromBranch);
    }

    if (selectedToBranch) {
      filtered = filtered.filter(t => t.to_branch_id === selectedToBranch);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.template_name?.toLowerCase().includes(term) ||
        t.item_name?.toLowerCase().includes(term) ||
        t.from_branch?.toLowerCase().includes(term) ||
        t.to_branch?.toLowerCase().includes(term)
      );
    }

    setFilteredTransfers(filtered);
  };

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedTransfer(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTransfer(null);
  };

  const handleSave = async (formData) => {
    try {
      await transferService.create(formData);
      alert('Transfer created successfully');
      handleCloseForm();
      fetchData();
    } catch (err) {
      alert(`Error creating transfer: ${err.message}`);
    }
  };

  const handleConfirm = async (transferId) => {
    if (!window.confirm('Confirm this transfer? This will complete the transfer and update inventory.')) return;

    try {
      await transferService.confirm(transferId);
      alert('Transfer confirmed successfully');
      fetchData();
    } catch (err) {
      alert(`Error confirming transfer: ${err.message}`);
    }
  };

  const handleCancel = async (transferId) => {
    if (!window.confirm('Cancel this transfer?')) return;

    try {
      await transferService.cancel(transferId);
      alert('Transfer cancelled');
      fetchData();
    } catch (err) {
      alert(`Error cancelling transfer: ${err.message}`);
    }
  };

  const handleDelete = async (transferId) => {
    if (!window.confirm('Delete this transfer? This action cannot be undone.')) return;

    try {
      await transferService.delete(transferId);
      alert('Transfer deleted');
      fetchData();
    } catch (err) {
      alert(`Error deleting transfer: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="transfer-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="transfer-container">
      {/* Header */}
      <div className="transfer-header">
        <h1>Transfer Management</h1>
        <p>Move inventory between branches</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total_transfers}</div>
            <div className="stat-label">Total Transfers</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{stats.pending_transfers}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card success">
            <div className="stat-number">{stats.completed_transfers}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_quantity_transferred}</div>
            <div className="stat-label">Units Moved</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search by template, item, or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="filter-select"
          value={selectedFromBranch || ''}
          onChange={(e) => setSelectedFromBranch(e.target.value ? e.target.value : null)}
        >
          <option value="">From Any Branch</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.branch_name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={selectedToBranch || ''}
          onChange={(e) => setSelectedToBranch(e.target.value ? e.target.value : null)}
        >
          <option value="">To Any Branch</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.branch_name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          + Create Transfer
        </button>
      </div>

      {/* Pending Alert */}
      {pendingTransfers.length > 0 && (
        <div className="pending-alert">
          <div className="alert-icon">📦</div>
          <div className="alert-content">
            <h3>Pending Transfers</h3>
            <p>{pendingTransfers.length} transfer(s) awaiting confirmation</p>
          </div>
        </div>
      )}

      {/* Transfers Table */}
      {filteredTransfers.length > 0 ? (
        <div className="transfers-table-wrapper">
          <table className="transfers-table">
            <thead>
              <tr>
                <th>From Branch</th>
                <th>To Branch</th>
                <th>Item / Template</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Transfer Date</th>
                <th>Received Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map(transfer => (
                <tr key={transfer.id} className={`status-${getStatusColor(transfer.status)}`}>
                  <td className="from-branch">
                    <strong>{transfer.from_branch}</strong>
                  </td>
                  <td className="to-branch">
                    <strong>{transfer.to_branch}</strong>
                  </td>
                  <td>
                    <div className="item-info">
                      <strong>{transfer.template_name}</strong>
                      <small>{transfer.item_name}</small>
                    </div>
                  </td>
                  <td className="quantity">
                    <strong>{transfer.quantity}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${transfer.status}`}>
                      {transfer.status?.charAt(0).toUpperCase() + transfer.status?.slice(1)}
                    </span>
                  </td>
                  <td className="date">
                    {new Date(transfer.transfer_date).toLocaleDateString()}
                  </td>
                  <td className="date">
                    {transfer.received_date ? new Date(transfer.received_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="notes">
                    {transfer.notes ? transfer.notes.substring(0, 20) + '...' : '-'}
                  </td>
                  <td className="actions">
                    {transfer.status === 'pending' && (
                      <>
                        <button
                          className="btn-action btn-confirm"
                          onClick={() => handleConfirm(transfer.id)}
                          title="Confirm transfer"
                        >
                          ✓
                        </button>
                        <button
                          className="btn-action btn-cancel"
                          onClick={() => handleCancel(transfer.id)}
                          title="Cancel transfer"
                        >
                          ✗
                        </button>
                      </>
                    )}
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(transfer.id)}
                      title="Delete transfer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No transfers found</h3>
          <p>
            {searchTerm || selectedStatus || selectedFromBranch || selectedToBranch 
              ? 'Try adjusting your filters' 
              : 'Create your first transfer to get started'}
          </p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            Create Transfer
          </button>
        </div>
      )}

      {/* Transfer Form Modal */}
      {isFormOpen && (
        <TransferForm
          branches={branches}
          templates={templates}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {/* Pending Transfers Section */}
      {pendingTransfers.length > 0 && (
        <div className="pending-transfers-section">
          <h2>Transfers Requiring Confirmation</h2>
          <div className="pending-list">
            {pendingTransfers.map(transfer => (
              <div key={transfer.id} className="pending-card">
                <div className="card-header">
                  <h4>{transfer.template_name}</h4>
                  <span className="quantity-badge">{transfer.quantity} units</span>
                </div>
                <div className="card-body">
                  <p><strong>From:</strong> {transfer.from_branch}</p>
                  <p><strong>To:</strong> {transfer.to_branch}</p>
                  <p><strong>Item:</strong> {transfer.item_name}</p>
                  <p><strong>Transfer Date:</strong> {new Date(transfer.transfer_date).toLocaleDateString()}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleConfirm(transfer.id)}
                  >
                    Confirm Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferListPage;
