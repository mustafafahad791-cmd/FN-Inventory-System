import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-left">
          <h2>FN Furniture</h2>
        </div>
        <div className="nav-right">
          {user ? (
            <button className="nav-button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <button className="nav-button" onClick={() => navigate('/login')}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Furniture Inventory System</h1>
          <p>Streamline your furniture business with our comprehensive inventory management solution</p>
          <button className="cta-button" onClick={handleStart}>
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">📦</div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🏢</div>
            <h3>Multi-Branch Management</h3>
            <p>Manage multiple store locations from one central system</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📦</div>
            <h3>Inventory Tracking</h3>
            <p>Real-time stock levels across all branches</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔄</div>
            <h3>Smart Transfers</h3>
            <p>Move inventory between branches with automated tracking</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🛒</div>
            <h3>Sales Management</h3>
            <p>Process receipts and manage customer transactions</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>Detailed insights into your inventory and sales</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security with role-based access control</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up and create your admin account</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Setup Branches</h3>
            <p>Add your store locations</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Add Products</h3>
            <p>Create your furniture catalog</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Manage Stock</h3>
            <p>Track and optimize your inventory</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join furniture businesses using our system today</p>
        <button className="cta-button-large" onClick={handleStart}>
          {user ? 'Go to Dashboard' : 'Create Account'}
        </button>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2026 FN Furniture Inventory System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
