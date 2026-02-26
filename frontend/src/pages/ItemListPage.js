import React, { useState, useEffect } from 'react';
import ItemForm from '../components/ItemForm';
import { api } from '../services/api';
import '../styles/ItemManagement.css';

const ItemListPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getItems();
      setItems(response.data);
      setFilteredItems(response.data);
      
      // Extract unique categories
      const cats = [...new Set(response.data.map(item => item.category).filter(Boolean))];
      setCategories(cats.sort());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterItems(term, selectedCategory);
  };

  const handleCategoryFilter = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterItems(searchTerm, category);
  };

  const filterItems = (term, category) => {
    let filtered = items;

    if (term) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          (item.unique_id && item.unique_id.toLowerCase().includes(term))
      );
    }

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }

    setFilteredItems(filtered);
  };

  const openCreateForm = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (formData, itemId) => {
    try {
      if (formMode === 'create') {
        const response = await api.createItem(formData);
        setItems([...items, response.data]);
        setFilteredItems([...filteredItems, response.data]);
        // Add category if new
        if (response.data.category && !categories.includes(response.data.category)) {
          setCategories([...categories, response.data.category].sort());
        }
      } else if (formMode === 'edit' && itemId) {
        const response = await api.updateItem(itemId, formData);
        const updatedItems = items.map((i) =>
          i.id === itemId ? response.data : i
        );
        setItems(updatedItems);
        setFilteredItems(
          filteredItems.map((i) =>
            i.id === itemId ? response.data : i
          )
        );
        // Update category list if new category added
        if (response.data.category && !categories.includes(response.data.category)) {
          setCategories([...categories, response.data.category].sort());
        }
      }
      closeForm();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (itemId) => {
    if (
      window.confirm(
        'Are you sure you want to deactivate this item? This action cannot be undone.'
      )
    ) {
      try {
        await api.deactivateItem(itemId);
        const updatedItems = items.filter((i) => i.id !== itemId);
        setItems(updatedItems);
        setFilteredItems(
          filteredItems.filter((i) => i.id !== itemId)
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to deactivate item');
      }
    }
  };

  return (
    <div className="items-container">
      <div className="items-header">
        <h1>Item Management</h1>
        <p>Create, manage, and organize your furniture items</p>
      </div>

      {error && (
        <div className="error-message" style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
          {error}
        </div>
      )}

      <div className="items-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, category, or ID..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={handleCategoryFilter}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button className="add-item-btn" onClick={openCreateForm}>
          + Add Item
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="items-list">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>{items.length === 0 ? 'No Items Yet' : 'No Results Found'}</h3>
            <p>
              {items.length === 0
                ? 'Create your first item to get started with inventory management.'
                : 'Try adjusting your search or category filters.'}
            </p>
            {items.length === 0 && (
              <button className="empty-state-btn" onClick={openCreateForm}>
                Create First Item
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="items-list">
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-header">
                  <div className="item-card-title">
                    <h3>{item.name}</h3>
                    <p className="item-unique-id">{item.unique_id}</p>
                  </div>
                  <span className={`item-status ${!item.is_active ? 'inactive' : ''}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span className="item-category-badge">{item.category}</span>
                </div>

                <div className="item-details">
                  {item.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value description">{item.description}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{item.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="item-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => openEditForm(item)}
                  >
                    ✎ Edit
                  </button>
                  {item.is_active && (
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(item.id)}
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

      <ItemForm
        item={selectedItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        onError={(err) => setError(err)}
        categories={categories}
      />
    </div>
  );
};

export default ItemListPage;
