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
  getBranchStats: (id) => apiClient.get(`/branches/${id}/stats`)
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
  getByItemId: (itemId) => apiClient.get(`/entry-templates?itemId=${itemId}`),
  create: (data) => apiClient.post('/entry-templates', data),
  update: (id, data) => apiClient.put(`/entry-templates/${id}`, data),
  delete: (id) => apiClient.delete(`/entry-templates/${id}`)
};

// Inventory Services
export const inventoryService = {
  getByBranch: (branchId) => apiClient.get(`/inventory?branchId=${branchId}`),
  updateQuantity: (branchId, templateId, quantity) =>
    apiClient.put('/inventory/quantity', { branchId, entryTemplateId: templateId, quantity })
};

// Receipt Services
export const receiptService = {
  create: (data) => apiClient.post('/receipts', data),
  getAll: () => apiClient.get('/receipts'),
  getById: (id) => apiClient.get(`/receipts/${id}`),
  downloadPDF: (id) => apiClient.get(`/receipts/${id}/pdf`, { responseType: 'blob' })
};

// Customer Services
export const customerService = {
  search: (query) => apiClient.get(`/customers/search?q=${query}`),
  getAll: () => apiClient.get('/customers'),
  getPurchaseHistory: (customerId) => apiClient.get(`/customers/${customerId}/history`)
};

const apiServices = {
  authService,
  branchService,
  itemService,
  entryTemplateService,
  inventoryService,
  receiptService,
  customerService
};

export default apiServices;
