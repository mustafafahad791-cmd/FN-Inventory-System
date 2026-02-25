import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>FN Furniture Inventory System</h1>
          <p>Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <div className="header-right">
          <button
            className="profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >
            👤 {user?.username}
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Dashboard</h2>
          <p>Manage your furniture inventory efficiently</p>
        </div>

        {/* Feature Cards */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="card-icon">📦</div>
            <h3>Items</h3>
            <p>Manage master products</p>
            <button className="card-button" onClick={() => navigate('/items')}>
              Go to Items →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">🏢</div>
            <h3>Branches</h3>
            <p>Manage store locations</p>
            <button className="card-button" onClick={() => navigate('/branches')}>
              Go to Branches →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">📝</div>
            <h3>Templates</h3>
            <p>Product variants & specs</p>
            <button className="card-button" onClick={() => navigate('/entry-templates')}>
              Go to Templates →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">📊</div>
            <h3>Inventory</h3>
            <p>Stock management</p>
            <button className="card-button" onClick={() => navigate('/inventory')}>
              Go to Inventory →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">🔄</div>
            <h3>Transfers</h3>
            <p>Move stock between branches</p>
            <button className="card-button" onClick={() => navigate('/transfers')}>
              Go to Transfers →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">🛒</div>
            <h3>Receipts</h3>
            <p>Sales & transactions</p>
            <button className="card-button" onClick={() => navigate('/receipts')}>
              Go to Receipts →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">👥</div>
            <h3>Customer Log</h3>
            <p>Purchase history & analytics</p>
            <button className="card-button" onClick={() => navigate('/customer-log')}>
              Go to Customers →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">📋</div>
            <h3>System Logs</h3>
            <p>Audit trail & monitoring</p>
            <button className="card-button" onClick={() => navigate('/system-logs')}>
              Go to Logs →
            </button>
          </div>

          <div className="feature-card">
            <div className="card-icon">📊</div>
            <h3>Analytics</h3>
            <p>Business intelligence & reports</p>
            <button className="card-button" onClick={() => navigate('/analytics')}>
              Go to Analytics →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <h4>System Status</h4>
            <p className="stat-value">✅ Online</p>
          </div>
          <div className="stat-card">
            <h4>Your Role</h4>
            <p className="stat-value">{user?.role?.toUpperCase()}</p>
          </div>
          <div className="stat-card">
            <h4>Logged In</h4>
            <p className="stat-value">Today</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>&copy; 2026 FN Furniture Inventory System. All features coming soon.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
