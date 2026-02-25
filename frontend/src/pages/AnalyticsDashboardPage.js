import React, { useState, useEffect } from 'react';
import apiServices from '../services/api';
import '../styles/AnalyticsDashboard.css';

const AnalyticsDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [productPerformance, setProductPerformance] = useState([]);
  const [customerSegmentation, setCustomerSegmentation] = useState([]);
  const [transferAnalytics, setTransferAnalytics] = useState([]);
  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dayRange, setDayRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dayRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, kpiData, products, customers, transfers] = await Promise.all([
        apiServices.analyticsService.getDashboardAnalytics(dayRange),
        apiServices.analyticsService.getKPIs(dayRange),
        apiServices.analyticsService.getProductPerformance(dayRange),
        apiServices.analyticsService.getCustomerSegmentation(),
        apiServices.analyticsService.getTransferAnalytics(dayRange)
      ]);

      setDashboardData(dashboard);
      setKpis(kpiData);
      setProductPerformance(products || []);
      setCustomerSegmentation(customers || []);
      setTransferAnalytics(transfers || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics & Dashboard</h1>
        <select
          value={dayRange}
          onChange={(e) => setDayRange(e.target.value)}
          className="period-select"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* KPIs Section */}
      {kpis && (
        <div className="kpi-section">
          <div className="kpi-card">
            <div className="kpi-label">Month-to-Date Revenue</div>
            <div className="kpi-value">Rs. {kpis.mtd?.mtd_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="kpi-meta">{kpis.mtd?.mtd_transactions} transactions</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Year-to-Date Revenue</div>
            <div className="kpi-value">Rs. {kpis.ytd?.ytd_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="kpi-meta">{kpis.ytd?.ytd_transactions} transactions</div>
          </div>
          <div className={`kpi-card ${kpis.growth_rate >= 0 ? 'positive' : 'negative'}`}>
            <div className="kpi-label">Period Growth Rate</div>
            <div className="kpi-value">{kpis.growth_rate > 0 ? '+' : ''}{kpis.growth_rate}%</div>
            <div className="kpi-meta">vs previous period</div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="overview-section">
          {/* Revenue Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Revenue Metrics</h3>
              <div className="metric-item">
                <span className="label">Total Revenue:</span>
                <span className="value">Rs. {dashboardData.revenue?.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="metric-item">
                <span className="label">Total Receipts:</span>
                <span className="value">{dashboardData.revenue?.total_receipts}</span>
              </div>
              <div className="metric-item">
                <span className="label">Avg Receipt:</span>
                <span className="value">Rs. {dashboardData.revenue?.avg_receipt_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="metric-card">
              <h3>Customer Metrics</h3>
              <div className="metric-item">
                <span className="label">Total Customers:</span>
                <span className="value">{dashboardData.customers?.total_customers || 0}</span>
              </div>
              <div className="metric-item">
                <span className="label">Repeat Customers:</span>
                <span className="value">{dashboardData.customers?.repeat_customers || 0}</span>
              </div>
              <div className="metric-item">
                <span className="label">Avg Customer Value:</span>
                <span className="value">Rs. {(dashboardData.customers?.avg_customer_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="metric-card">
              <h3>Inventory Metrics</h3>
              <div className="metric-item">
                <span className="label">Total Items In Stock:</span>
                <span className="value">{dashboardData.inventory?.total_items_in_stock || 0}</span>
              </div>
              <div className="metric-item">
                <span className="label">Unique Templates:</span>
                <span className="value">{dashboardData.inventory?.unique_templates || 0}</span>
              </div>
              <div className="metric-item">
                <span className="label">Avg Stock Level:</span>
                <span className="value">{Math.round(dashboardData.inventory?.avg_stock_level || 0)} units</span>
              </div>
            </div>
          </div>

          {/* Branch Performance */}
          {dashboardData.branch_performance && dashboardData.branch_performance.length > 0 && (
            <div className="performance-section">
              <h3>Branch Performance</h3>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Receipts</th>
                    <th>Revenue</th>
                    <th>Customers</th>
                    <th>Avg Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.branch_performance.map(branch => (
                    <tr key={branch.id}>
                      <td><strong>{branch.name}</strong></td>
                      <td>{branch.receipts_count}</td>
                      <td>Rs. {branch.branch_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{branch.unique_customers}</td>
                      <td>Rs. {branch.avg_receipt?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Products */}
          {dashboardData.top_products && dashboardData.top_products.length > 0 && (
            <div className="performance-section">
              <h3>Top Products (Last {dayRange} Days)</h3>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.top_products.slice(0, 10).map((product, idx) => (
                    <tr key={idx}>
                      <td>{product.item_name}</td>
                      <td>{product.template_name}</td>
                      <td>{product.total_sold}</td>
                      <td>Rs. {product.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>Rs. {product.avg_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Daily Trend */}
          {dashboardData.daily_trend && dashboardData.daily_trend.length > 0 && (
            <div className="performance-section">
              <h3>Daily Revenue Trend</h3>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Receipts</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.daily_trend.slice(0, 20).map((day, idx) => (
                    <tr key={idx}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.receipt_count}</td>
                      <td>Rs. {day.daily_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && productPerformance.length > 0 && (
        <div className="products-section">
          <h3>Product Performance Analysis</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Times Sold</th>
                <th>Total Qty</th>
                <th>Revenue</th>
                <th>Avg Price</th>
                <th>Price Range</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.item_name} - {product.template_name}</td>
                  <td>{product.times_sold}</td>
                  <td>{product.total_quantity}</td>
                  <td>Rs. {product.total_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>Rs. {product.avg_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>Rs. {product.min_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - Rs. {product.max_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && customerSegmentation.length > 0 && (
        <div className="customers-section">
          <h3>Customer Segmentation</h3>
          <div className="segmentation-grid">
            {customerSegmentation.map((segment, idx) => (
              <div key={idx} className="segment-card">
                <div className="segment-name">{segment.segment}</div>
                <div className="segment-count">{segment.customer_count} Customers</div>
                <div className="segment-stat">
                  <span>Avg Spent:</span>
                  <span>Rs. {segment.avg_spent?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="segment-stat">
                  <span>Total Revenue:</span>
                  <span>Rs. {segment.segment_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && transferAnalytics.length > 0 && (
        <div className="transfers-section">
          <h3>Transfer Analytics</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>From Branch</th>
                <th>To Branch</th>
                <th>Transfers</th>
                <th>Total Qty</th>
                <th>Pending</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {transferAnalytics.map((transfer, idx) => (
                <tr key={idx}>
                  <td>{transfer.from_branch}</td>
                  <td>{transfer.to_branch}</td>
                  <td>{transfer.transfer_count}</td>
                  <td>{transfer.total_quantity}</td>
                  <td className="pending">{transfer.pending_transfers}</td>
                  <td className="completed">{transfer.completed_transfers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({productPerformance.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers ({customerSegmentation.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          Transfers ({transferAnalytics.length})
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
