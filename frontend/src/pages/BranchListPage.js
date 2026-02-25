import React, { useState, useEffect } from 'react';
import BranchForm from '../components/BranchForm';
import { authService } from '../services/api';
import '../styles/BranchManagement.css';

const BranchListPage = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [branchStats, setBranchStats] = useState({});

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.getBranches();
      setBranches(response.data);
      setFilteredBranches(response.data);
      // Fetch stats for each branch
      fetchBranchesStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch branches');
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchesStats = async (branchList) => {
    const stats = {};
    for (const branch of branchList) {
      try {
        const response = await authService.getBranchStats(branch.id);
        stats[branch.id] = response.data;
      } catch (err) {
        console.error(`Failed to fetch stats for branch ${branch.id}:`, err);
        stats[branch.id] = { items_count: 0, receipts_count: 0 };
      }
    }
    setBranchStats(stats);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(term) ||
          branch.location.toLowerCase().includes(term) ||
          (branch.phone && branch.phone.includes(term)) ||
          (branch.email && branch.email.toLowerCase().includes(term))
      );
      setFilteredBranches(filtered);
    }
  };

  const openCreateForm = () => {
    setSelectedBranch(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (branch) => {
    setSelectedBranch(branch);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedBranch(null);
  };

  const handleSave = async (formData, branchId) => {
    try {
      if (formMode === 'create') {
        const response = await authService.createBranch(formData);
        setBranches([...branches, response.data]);
        setFilteredBranches([...filteredBranches, response.data]);
        // Fetch stats for new branch
        try {
          const statsResponse = await authService.getBranchStats(response.data.id);
          setBranchStats((prev) => ({
            ...prev,
            [response.data.id]: statsResponse.data,
          }));
        } catch (err) {
          console.error('Failed to fetch stats for new branch:', err);
        }
      } else if (formMode === 'edit' && branchId) {
        const response = await authService.updateBranch(branchId, formData);
        const updatedBranches = branches.map((b) =>
          b.id === branchId ? response.data : b
        );
        setBranches(updatedBranches);
        setFilteredBranches(
          filteredBranches.map((b) =>
            b.id === branchId ? response.data : b
          )
        );
      }
      closeForm();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to deactivate this branch? This action cannot be undone.')) {
      try {
        await authService.deactivateBranch(branchId);
        const updatedBranches = branches.filter((b) => b.id !== branchId);
        setBranches(updatedBranches);
        setFilteredBranches(
          filteredBranches.filter((b) => b.id !== branchId)
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate branch');
      }
    }
  };

  return (
    <div className="branches-container">
      <div className="branches-header">
        <h1>Branch Management</h1>
        <p>Create, manage, and organize your store locations</p>
      </div>

      {error && <div className="error-message" style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>{error}</div>}

      <div className="branches-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, location, phone, or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="add-branch-btn" onClick={openCreateForm}>
          + Add Branch
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading branches...
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="branches-list">
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <h3>{branches.length === 0 ? 'No Branches Yet' : 'No Results Found'}</h3>
            <p>
              {branches.length === 0
                ? 'Create your first branch to get started with multi-location inventory management.'
                : 'Try adjusting your search terms.'}
            </p>
            {branches.length === 0 && (
              <button className="empty-state-btn" onClick={openCreateForm}>
                Create First Branch
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="branches-list">
          <div className="branches-grid">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="branch-card">
                <div className="branch-card-header">
                  <div className="branch-card-title">
                    <h3>{branch.name}</h3>
                    <p className="branch-location">{branch.location}</p>
                  </div>
                  <span className={`branch-status ${!branch.is_active ? 'inactive' : ''}`}>
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="branch-details">
                  {branch.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        <a href={`mailto:${branch.email}`}>{branch.email}</a>
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{branch.id}</span>
                  </div>
                </div>

                {branchStats[branch.id] && (
                  <div className="branch-stats">
                    <div className="stat">
                      <div className="stat-value">{branchStats[branch.id].items_count || 0}</div>
                      <div className="stat-label">Items</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{branchStats[branch.id].receipts_count || 0}</div>
                      <div className="stat-label">Receipts</div>
                    </div>
                  </div>
                )}

                <div className="branch-actions">
                  <button
                    className="btn-action btn-view"
                    onClick={() => openEditForm(branch)}
                  >
                    📋 View Details
                  </button>
                  <button
                    className="btn-action btn-edit"
                    onClick={() => openEditForm(branch)}
                  >
                    ✎ Edit
                  </button>
                  {branch.is_active && (
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(branch.id)}
                    >
                      🗑️ Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BranchForm
        branch={selectedBranch}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        onError={(err) => setError(err)}
      />
    </div>
  );
};

export default BranchListPage;
