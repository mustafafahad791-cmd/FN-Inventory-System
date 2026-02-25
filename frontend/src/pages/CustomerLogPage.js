import React, { useState, useEffect } from 'react';
import apiServices from '../services/api';
import '../styles/CustomerLogManagement.css';

const CustomerLogPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [repeatCustomers, setRepeatCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, top, repeat

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allCustomers, topCust, repeatCust] = await Promise.all([
        apiServices.customerLogService.getAll(),
        apiServices.customerLogService.getTopCustomers(),
        apiServices.customerLogService.getRepeatCustomers()
      ]);

      setCustomers(allCustomers || []);
      setTopCustomers(topCust || []);
      setRepeatCustomers(repeatCust || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(term)) ||
        c.customer_id.toLowerCase().includes(term)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const data = await apiServices.customerLogService.getPurchaseHistory(customerId);
      setSelectedCustomer(data.customer);
      setCustomerStats(data.statistics);
      setPurchaseHistory(data.purchases);

      // Fetch preferences
      const prefs = await apiServices.customerLogService.getCustomerPreferences(customerId);
      setPreferences(prefs || []);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      alert('Failed to load customer details');
    }
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'top':
        return topCustomers;
      case 'repeat':
        return repeatCustomers;
      default:
        return filteredCustomers;
    }
  };

  const displayData = getDisplayData();

  if (loading) {
    return <div className="loading">Loading customer data...</div>;
  }

  return (
    <div className="customer-log-management">
      <div className="customer-log-header">
        <h1>Customer Log & Analytics</h1>
        <p>Track customer purchase history and behavior</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{repeatCustomers.length}</div>
          <div className="stat-label">Repeat Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            Rs. {customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Customers ({customers.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          Top Customers ({topCustomers.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'repeat' ? 'active' : ''}`}
          onClick={() => setActiveTab('repeat')}
        >
          Repeat Customers ({repeatCustomers.length})
        </button>
      </div>

      {/* Search (only for All tab) */}
      {activeTab === 'all' && (
        <div className="customer-controls">
          <input
            type="text"
            placeholder="Search by name, phone, or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Customers Table */}
      <div className="customer-table-container">
        {displayData.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
          </div>
        ) : (
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Purchases</th>
                <th>Total Spent</th>
                <th>Avg Purchase</th>
                <th>Last Purchase</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map(customer => (
                <tr key={customer.id} className={customer.total_purchases > 1 ? 'repeat-customer' : ''}>
                  <td>{customer.customer_id}</td>
                  <td><strong>{customer.name || 'Unknown'}</strong></td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.total_purchases}</td>
                  <td>Rs. {customer.total_spent?.toFixed(2)}</td>
                  <td>Rs. {customer.avg_purchase?.toFixed(2)}</td>
                  <td>
                    {customer.last_purchase_date
                      ? new Date(customer.last_purchase_date).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewCustomer(customer.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content customer-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCustomer.name || 'Customer Details'}</h2>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>

            <div className="modal-body">
              {/* Customer Info */}
              <div className="customer-info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div>
                    <label>Customer ID:</label>
                    <p>{selectedCustomer.customer_id}</p>
                  </div>
                  <div>
                    <label>Name:</label>
                    <p>{selectedCustomer.name || '-'}</p>
                  </div>
                  <div>
                    <label>Phone:</label>
                    <p>{selectedCustomer.phone || '-'}</p>
                  </div>
                  <div>
                    <label>Member Since:</label>
                    <p>{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {customerStats && (
                <div className="customer-stats-section">
                  <h3>Purchase Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="label">Total Purchases</div>
                      <div className="value">{customerStats.total_purchases}</div>
                    </div>
                    <div className="stat-box">
                      <div className="label">Total Spent</div>
                      <div className="value">Rs. {customerStats.total_spent?.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="label">Average Purchase</div>
                      <div className="value">Rs. {customerStats.avg_purchase?.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="label">Max Purchase</div>
                      <div className="value">Rs. {customerStats.max_purchase?.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="label">Min Purchase</div>
                      <div className="value">Rs. {customerStats.min_purchase?.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="label">Branches Visited</div>
                      <div className="value">{customerStats.branches_visited}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Preferences */}
              {preferences.length > 0 && (
                <div className="preferences-section">
                  <h3>Top Purchase Preferences</h3>
                  <table className="preferences-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Variant</th>
                        <th>Times Purchased</th>
                        <th>Total Quantity</th>
                        <th>Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preferences.slice(0, 10).map((pref, idx) => (
                        <tr key={idx}>
                          <td>{pref.item_name}</td>
                          <td>{pref.template_name}</td>
                          <td>{pref.times_purchased}</td>
                          <td>{pref.total_quantity}</td>
                          <td>Rs. {pref.avg_price_paid?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Purchase History */}
              {purchaseHistory.length > 0 && (
                <div className="purchase-history-section">
                  <h3>Recent Purchases (Last 10)</h3>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Receipt ID</th>
                        <th>Branch</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseHistory.slice(0, 10).map(purchase => (
                        <tr key={purchase.id}>
                          <td>{purchase.receipt_id}</td>
                          <td>{purchase.branch_name}</td>
                          <td>{purchase.item_count}</td>
                          <td>Rs. {purchase.total_price?.toFixed(2)}</td>
                          <td>{new Date(purchase.receipt_timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="history-note">
                    Showing 10 most recent purchases. Total: {purchaseHistory.length}
                  </p>
                </div>
              )}

              {purchaseHistory.length === 0 && (
                <div className="no-history">
                  <p>No purchase history available for this customer</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLogPage;
