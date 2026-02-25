import React, { useState, useEffect } from 'react';
import apiServices from '../services/api';
import '../styles/SystemLogManagement.css';

const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [actionBreakdown, setActionBreakdown] = useState([]);
  const [entityBreakdown, setEntityBreakdown] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    action_type: 'all',
    status: 'all',
    entity_type: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allLogs, statsData, healthData, actions, entities, errors] = await Promise.all([
        apiServices.systemLogService.getAll(),
        apiServices.systemLogService.getStats(),
        apiServices.systemLogService.getHealthSummary(),
        apiServices.systemLogService.getActionBreakdown(),
        apiServices.systemLogService.getEntityBreakdown(),
        apiServices.systemLogService.getErrors()
      ]);

      setLogs(allLogs || []);
      setStats(statsData);
      setHealth(healthData);
      setActionBreakdown(actions || []);
      setEntityBreakdown(entities || []);
      setErrorLogs(errors || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.action_type !== 'all') {
      filtered = filtered.filter(l => l.action_type === filters.action_type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(l => l.status === filters.status);
    }

    if (filters.entity_type !== 'all') {
      filtered = filtered.filter(l => l.entity_type === filters.entity_type);
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'errors':
        return errorLogs;
      default:
        return filteredLogs;
    }
  };

  const displayData = getDisplayData();

  if (loading) {
    return <div className="loading">Loading system logs...</div>;
  }

  return (
    <div className="system-log-management">
      <div className="system-log-header">
        <h1>System Logs & Audit Trail</h1>
        <p>Monitor all system activities and track changes</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Health Summary */}
      {health && (
        <div className="health-summary">
          <div className="health-card">
            <div className="health-period">Last 24 Hours</div>
            <div className="health-data">
              <div className="health-stat">
                <span className="label">Total Actions:</span>
                <span className="value">{health.last_24_hours.total_actions}</span>
              </div>
              <div className="health-stat">
                <span className="label">Errors:</span>
                <span className="value error">{health.last_24_hours.errors}</span>
              </div>
              <div className="health-stat">
                <span className="label">Error Rate:</span>
                <span className={`value ${health.last_24_hours.error_rate > 5 ? 'warning' : 'success'}`}>
                  {health.last_24_hours.error_rate}%
                </span>
              </div>
            </div>
          </div>

          <div className="health-card">
            <div className="health-period">Last 7 Days</div>
            <div className="health-data">
              <div className="health-stat">
                <span className="label">Total Actions:</span>
                <span className="value">{health.last_7_days.total_actions}</span>
              </div>
              <div className="health-stat">
                <span className="label">Errors:</span>
                <span className="value error">{health.last_7_days.errors}</span>
              </div>
              <div className="health-stat">
                <span className="label">Error Rate:</span>
                <span className={`value ${health.last_7_days.error_rate > 5 ? 'warning' : 'success'}`}>
                  {health.last_7_days.error_rate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="log-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_logs}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.success_logs}</div>
            <div className="stat-label">Successful</div>
          </div>
          <div className="stat-card error">
            <div className="stat-value">{stats.error_logs}</div>
            <div className="stat-label">Errors</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unique_actions}</div>
            <div className="stat-label">Action Types</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Logs ({filteredLogs.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          Errors ({errorLogs.length})
        </button>
      </div>

      {/* Filters (only for All tab) */}
      {activeTab === 'all' && (
        <div className="log-filters">
          <select
            value={filters.action_type}
            onChange={(e) => handleFilterChange('action_type', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            {actionBreakdown.map(action => (
              <option key={action.action_type} value={action.action_type}>
                {action.action_type} ({action.count})
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="success">Success Only</option>
            <option value="error">Errors Only</option>
          </select>

          <select
            value={filters.entity_type}
            onChange={(e) => handleFilterChange('entity_type', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Entity Types</option>
            {entityBreakdown.map(entity => (
              <option key={entity.entity_type} value={entity.entity_type}>
                {entity.entity_type} ({entity.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Logs Table */}
      <div className="log-table-container">
        {displayData.length === 0 ? (
          <div className="empty-state">
            <p>No logs found</p>
          </div>
        ) : (
          <table className="log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {displayData.slice(0, 100).map((log, idx) => (
                <tr key={idx} className={`status-${log.status}`}>
                  <td>{new Date(log.log_timestamp).toLocaleString()}</td>
                  <td><span className="action-badge">{log.action_type}</span></td>
                  <td>{log.entity_type || '-'}</td>
                  <td className="description">{log.action_description || '-'}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>{log.user_id || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {displayData.length > 100 && (
          <p className="log-pagination">Showing 100 of {displayData.length} logs</p>
        )}
      </div>

      {/* Action Breakdown */}
      {actionBreakdown.length > 0 && activeTab === 'all' && (
        <div className="breakdown-section">
          <h3>Action Breakdown</h3>
          <div className="breakdown-grid">
            {actionBreakdown.slice(0, 8).map(action => (
              <div key={action.action_type} className="breakdown-card">
                <div className="breakdown-label">{action.action_type}</div>
                <div className="breakdown-stats">
                  <div className="breakdown-stat">
                    <span className="label">Total:</span>
                    <span className="value">{action.count}</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="label">Success:</span>
                    <span className="value success">{action.success_count}</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="label">Failed:</span>
                    <span className="value error">{action.error_count}</span>
                  </div>
                  <div className="breakdown-stat">
                    <span className="label">Rate:</span>
                    <span className="value">{action.success_rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogPage;
