import apiClient from './apiClient';

// Auth Services
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  verify: () => apiClient.get('/auth/verify'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  getAllUsers: () => apiClient.get('/auth/users'),
  
  // Branch Management Services
  getBranches: () => apiClient.get('/branches'),
  getBranchById: (id) => apiClient.get(`/branches/${id}`),
  createBranch: (data) => apiClient.post('/branches', data),
  updateBranch: (id, data) => apiClient.put(`/branches/${id}`, data),
  deactivateBranch: (id) => apiClient.delete(`/branches/${id}`),
  searchBranches: (query) => apiClient.get(`/branches/search?q=${query}`),
  getBranchStats: (id) => apiClient.get(`/branches/${id}/stats`),

  // Item Management Services
  getItems: () => apiClient.get('/items'),
  getItemById: (id) => apiClient.get(`/items/${id}`),
  createItem: (data) => apiClient.post('/items', data),
  updateItem: (id, data) => apiClient.put(`/items/${id}`, data),
  deactivateItem: (id) => apiClient.delete(`/items/${id}`),
  searchItems: (query) => apiClient.get(`/items/search?q=${query}`),
  getItemsByCategory: (category) => apiClient.get(`/items/category/${category}`),
  getItemCategories: () => apiClient.get('/items/categories/all'),
  getItemStats: () => apiClient.get('/items/stats')
};

// Branch Services
export const branchService = {
  getAll: () => apiClient.get('/branches'),
  getById: (id) => apiClient.get(`/branches/${id}`),
  create: (data) => apiClient.post('/branches', data),
  update: (id, data) => apiClient.put(`/branches/${id}`, data),
  delete: (id) => apiClient.delete(`/branches/${id}`)
};

// Item Services
export const itemService = {
  getAll: () => apiClient.get('/items'),
  getById: (id) => apiClient.get(`/items/${id}`),
  create: (data) => apiClient.post('/items', data),
  update: (id, data) => apiClient.put(`/items/${id}`, data),
  delete: (id) => apiClient.delete(`/items/${id}`)
};

// Entry Template Services
export const entryTemplateService = {
  getAll: () => apiClient.get('/entry-templates'),
  getById: (id) => apiClient.get(`/entry-templates/${id}`),
  getByItemId: (itemId) => apiClient.get(`/entry-templates/item/${itemId}`),
  create: (data) => apiClient.post('/entry-templates', data),
  update: (id, data) => apiClient.put(`/entry-templates/${id}`, data),
  delete: (id) => apiClient.delete(`/entry-templates/${id}`),
  getStats: () => apiClient.get('/entry-templates/stats')
};

// Inventory Services
export const inventoryService = {
  getAll: () => apiClient.get('/inventory'),
  getById: (id) => apiClient.get(`/inventory/${id}`),
  getByBranch: (branchId) => apiClient.get(`/inventory/branch/${branchId}`),
  getByTemplate: (templateId) => apiClient.get(`/inventory/template/${templateId}`),
  create: (data) => apiClient.post('/inventory', data),
  update: (id, data) => apiClient.put(`/inventory/${id}`, data),
  adjust: (id, data) => apiClient.post(`/inventory/${id}/adjust`, data),
  delete: (id) => apiClient.delete(`/inventory/${id}`),
  getStats: () => apiClient.get('/inventory/stats'),
  getLowStock: () => apiClient.get('/inventory/low-stock')
};

// Transfer Services
export const transferService = {
  getAll: () => apiClient.get('/transfers'),
  getById: (id) => apiClient.get(`/transfers/${id}`),
  getFromBranch: (branchId) => apiClient.get(`/transfers/from/${branchId}`),
  getToBranch: (branchId) => apiClient.get(`/transfers/to/${branchId}`),
  create: (data) => apiClient.post('/transfers', data),
  confirm: (id) => apiClient.post(`/transfers/${id}/confirm`),
  cancel: (id) => apiClient.post(`/transfers/${id}/cancel`),
  delete: (id) => apiClient.delete(`/transfers/${id}`),
  getStats: () => apiClient.get('/transfers/stats'),
  getPending: () => apiClient.get('/transfers/pending')
};

// Receipt Services
export const receiptService = {
  create: (data) => apiClient.post('/receipts', data),
  getAll: () => apiClient.get('/receipts'),
  getById: (id) => apiClient.get(`/receipts/${id}`),
  getByBranch: (branchId, params) => apiClient.get(`/receipts/branch/${branchId}`, { params }),
  getByCustomer: (customerId) => apiClient.get(`/receipts/customer/${customerId}`),
  getStats: () => apiClient.get('/receipts/stats'),
  getSalesByDateRange: (startDate, endDate) => apiClient.get('/receipts/sales-report', { params: { startDate, endDate } }),
  search: (term) => apiClient.get('/receipts/search', { params: { term } }),
  downloadPDF: (id) => apiClient.get(`/receipts/${id}/pdf`, { responseType: 'blob' })
};

// Customer Services
export const customerService = {
  getOrCreateCustomer: (data) => apiClient.post('/customers', data),
  search: (query) => apiClient.get(`/customers/search?q=${query}`),
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`)
};

const apiServices = {
  authService,
  branchService,
  itemService,
  entryTemplateService,
  inventoryService,
  transferService,
  receiptService,
  customerService
};

export default apiServices;
