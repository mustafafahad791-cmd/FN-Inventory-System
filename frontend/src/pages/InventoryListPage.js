import React, { useState, useEffect } from 'react';
import { inventoryService, branchService, entryTemplateService } from '../services/api';
import '../styles/InventoryManagement.css';

const InventoryListPage = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Fetch inventory, branches, and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryData, branchesData, templatesData, statsData, lowStockData] = await Promise.all([
        inventoryService.getAll(),
        branchService.getAll(),
        entryTemplateService.getAll(),
        inventoryService.getStats(),
        inventoryService.getLowStock()
      ]);

      setInventory(inventoryData);
      setBranches(branchesData);
      setTemplates(templatesData);
      setStats(statsData);
      setLowStockItems(lowStockData);

      // Apply filters
      applyFilters(inventoryData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever data or filters change
  useEffect(() => {
    applyFilters(inventory);
  }, [selectedBranch, searchTerm, showLowStockOnly, inventory]);

  // Filter inventory based on branch, search, and low stock
  const applyFilters = (data) => {
    let filtered = data;

    // Filter by branch
    if (selectedBranch) {
      filtered = filtered.filter(item => item.branch_id === selectedBranch);
    }

    // Filter by search term (template name, item name, branch name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.template_name.toLowerCase().includes(term) ||
        item.item_name.toLowerCase().includes(term) ||
        item.branch_name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    // Filter by low stock
    if (showLowStockOnly) {
      filtered = filtered.filter(item => item.quantity_in_stock <= item.reorder_level);
    }

    setFilteredInventory(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle branch filter
  const handleBranchFilter = (e) => {
    const value = e.target.value;
    setSelectedBranch(value ? value : null);
  };

  // Handle quantity adjustment
  const handleAdjustQuantity = async (inventoryId, currentQuantity) => {
    const adjustment = prompt('Enter quantity adjustment (positive or negative):', '0');
    if (adjustment === null) return;

    const quantity = parseInt(adjustment);
    if (isNaN(quantity)) {
      alert('Please enter a valid number');
      return;
    }

    const reason = prompt('Enter reason for adjustment:', '');
    if (reason === null) return;

    try {
      await inventoryService.adjust(inventoryId, { quantity, reason });
      alert('Inventory adjusted successfully');
      fetchData();
    } catch (err) {
      alert(`Error adjusting inventory: ${err.message}`);
    }
  };

  // Handle delete
  const handleDelete = async (inventoryId) => {
    if (!window.confirm('Are you sure you want to deactivate this inventory record?')) return;

    try {
      await inventoryService.delete(inventoryId);
      alert('Inventory record deactivated');
      fetchData();
    } catch (err) {
      alert(`Error deleting inventory: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <p>Track stock levels across branches and templates</p>
      </div>

      {/* Error Display */}
      {error && <div className="error-message">{error}</div>}

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total_records}</div>
            <div className="stat-label">Total Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.branches_with_inventory}</div>
            <div className="stat-label">Branches</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_quantity || 0}</div>
            <div className="stat-label">Total Units</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{Math.round(stats.average_quantity || 0)}</div>
            <div className="stat-label">Avg. Qty</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{stats.low_stock_count}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="controls-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search by template, item, or branch..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <select
          className="filter-select"
          value={selectedBranch || ''}
          onChange={handleBranchFilter}
        >
          <option value="">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.branch_name}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
          />
          Low Stock Only
        </label>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Low Stock Alert</h3>
            <p>{lowStockItems.length} items are below reorder level</p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {filteredInventory.length > 0 ? (
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Template / Item</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Last Counted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const isLowStock = item.quantity_in_stock <= item.reorder_level;
                return (
                  <tr key={item.id} className={isLowStock ? 'low-stock-row' : ''}>
                    <td className="branch-name">
                      <strong>{item.branch_name}</strong>
                      <small>{item.location}</small>
                    </td>
                    <td>
                      <strong>{item.template_name}</strong>
                      <small>{item.item_name}</small>
                    </td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td className="price">
                      ${item.unit_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className={`quantity ${isLowStock ? 'low' : 'normal'}`}>
                      <strong>{item.quantity_in_stock}</strong>
                    </td>
                    <td className="reorder-level">
                      {item.reorder_level}
                    </td>
                    <td>
                      <span className={`status-badge ${isLowStock ? 'low-stock' : 'in-stock'}`}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(item.last_counted_at).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-adjust"
                        onClick={() => handleAdjustQuantity(item.id, item.quantity_in_stock)}
                        title="Adjust quantity"
                      >
                        ⚙️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                        title="Deactivate"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No inventory records found</h3>
          <p>
            {searchTerm || selectedBranch ? 'Try adjusting your filters' : 'No inventory has been created yet'}
          </p>
        </div>
      )}

      {/* Low Stock Items Table */}
      {lowStockItems.length > 0 && (
        <div className="low-stock-section">
          <h2>Low Stock Items (Below Reorder Level)</h2>
          <div className="low-stock-table-wrapper">
            <table className="low-stock-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Template / Item</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Shortage</th>
                  <th>Last Counted</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.branch_name}</strong>
                    </td>
                    <td>
                      <strong>{item.template_name}</strong>
                      <small>{item.item_name}</small>
                    </td>
                    <td className="quantity-low">{item.quantity_in_stock}</td>
                    <td>{item.reorder_level}</td>
                    <td className="shortage">
                      <strong>{item.shortage_quantity} units</strong>
                    </td>
                    <td className="date">
                      {new Date(item.last_counted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {stats && (
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Quantity Range</h4>
              <p>{stats.min_quantity || 0} - {stats.max_quantity || 0} units</p>
            </div>
            <div className="summary-card">
              <h4>Average Quantity</h4>
              <p>{Math.round(stats.average_quantity || 0)} units</p>
            </div>
            <div className="summary-card">
              <h4>Templates Tracked</h4>
              <p>{stats.templates_tracked} templates</p>
            </div>
            <div className="summary-card">
              <h4>Total Value</h4>
              <p>
                ${(filteredInventory.reduce((sum, item) => 
                  sum + (item.quantity_in_stock * (item.unit_price || 0)), 0
                )).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryListPage;
