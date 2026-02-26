import apiClient from './apiClient';

// Auth Services
export const authService = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  verify: () => apiClient.get('/api/auth/verify'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  updateProfile: (data) => apiClient.put('/api/auth/profile', data),
  getAllUsers: () => apiClient.get('/api/auth/users'),
  
  // Branch Management Services
  getBranches: () => apiClient.get('/api/branches'),
  getBranchById: (id) => apiClient.get(`/api/branches/${id}`),
  createBranch: (data) => apiClient.post('/api/branches', data),
  updateBranch: (id, data) => apiClient.put(`/api/branches/${id}`, data),
  deactivateBranch: (id) => apiClient.delete(`/api/branches/${id}`),
  searchBranches: (query) => apiClient.get(`/api/branches/search?q=${query}`),
  getBranchStats: (id) => apiClient.get(`/api/branches/${id}/stats`),

  // Item Management Services
  getItems: () => apiClient.get('/api/items'),
  getItemById: (id) => apiClient.get(`/api/items/${id}`),
  createItem: (data) => apiClient.post('/api/items', data),
  updateItem: (id, data) => apiClient.put(`/api/items/${id}`, data),
  deactivateItem: (id) => apiClient.delete(`/api/items/${id}`),
  searchItems: (query) => apiClient.get(`/api/items/search?q=${query}`),
  getItemsByCategory: (category) => apiClient.get(`/api/items/category/${category}`),
  getItemCategories: () => apiClient.get('/api/items/categories/all'),
  getItemStats: () => apiClient.get('/api/items/stats')
};

// Branch Services
export const branchService = {
  getAll: () => apiClient.get('/api/branches'),
  getById: (id) => apiClient.get(`/api/branches/${id}`),
  create: (data) => apiClient.post('/api/branches', data),
  update: (id, data) => apiClient.put(`/api/branches/${id}`, data),
  delete: (id) => apiClient.delete(`/api/branches/${id}`)
};

// Item Services
export const itemService = {
  getAll: () => apiClient.get('/api/items'),
  getById: (id) => apiClient.get(`/api/items/${id}`),
  create: (data) => apiClient.post('/api/items', data),
  update: (id, data) => apiClient.put(`/api/items/${id}`, data),
  delete: (id) => apiClient.delete(`/api/items/${id}`)
};

// Entry Template Services
export const entryTemplateService = {
  getAll: () => apiClient.get('/api/entry-templates'),
  getById: (id) => apiClient.get(`/api/entry-templates/${id}`),
  getByItemId: (itemId) => apiClient.get(`/api/entry-templates/item/${itemId}`),
  create: (data) => apiClient.post('/api/entry-templates', data),
  update: (id, data) => apiClient.put(`/api/entry-templates/${id}`, data),
  delete: (id) => apiClient.delete(`/api/entry-templates/${id}`),
  getStats: () => apiClient.get('/api/entry-templates/stats')
};

// Inventory Services
export const inventoryService = {
  getAll: () => apiClient.get('/api/inventory'),
  getById: (id) => apiClient.get(`/api/inventory/${id}`),
  getByBranch: (branchId) => apiClient.get(`/api/inventory/branch/${branchId}`),
  getByTemplate: (templateId) => apiClient.get(`/api/inventory/template/${templateId}`),
  create: (data) => apiClient.post('/api/inventory', data),
  update: (id, data) => apiClient.put(`/api/inventory/${id}`, data),
  adjust: (id, data) => apiClient.post(`/api/inventory/${id}/adjust`, data),
  delete: (id) => apiClient.delete(`/api/inventory/${id}`),
  getStats: () => apiClient.get('/api/inventory/stats'),
  getLowStock: () => apiClient.get('/api/inventory/low-stock')
};

// Transfer Services
export const transferService = {
  getAll: () => apiClient.get('/api/transfers'),
  getById: (id) => apiClient.get(`/api/transfers/${id}`),
  getFromBranch: (branchId) => apiClient.get(`/api/transfers/from/${branchId}`),
  getToBranch: (branchId) => apiClient.get(`/api/transfers/to/${branchId}`),
  create: (data) => apiClient.post('/api/transfers', data),
  confirm: (id) => apiClient.post(`/api/transfers/${id}/confirm`),
  cancel: (id) => apiClient.post(`/api/transfers/${id}/cancel`),
  delete: (id) => apiClient.delete(`/api/transfers/${id}`),
  getStats: () => apiClient.get('/api/transfers/stats'),
  getPending: () => apiClient.get('/api/transfers/pending')
};

// Receipt Services
export const receiptService = {
  create: (data) => apiClient.post('/api/receipts', data),
  getAll: () => apiClient.get('/api/receipts'),
  getById: (id) => apiClient.get(`/api/receipts/${id}`),
  getByBranch: (branchId, params) => apiClient.get(`/api/receipts/branch/${branchId}`, { params }),
  getByCustomer: (customerId) => apiClient.get(`/api/receipts/customer/${customerId}`),
  getStats: () => apiClient.get('/api/receipts/stats'),
  getSalesByDateRange: (startDate, endDate) => apiClient.get('/api/receipts/sales-report', { params: { startDate, endDate } }),
  search: (term) => apiClient.get('/api/receipts/search', { params: { term } }),
  downloadPDF: (id) => apiClient.get(`/api/receipts/${id}/pdf`, { responseType: 'blob' })
};

// Customer Services
export const customerService = {
  getOrCreateCustomer: (data) => apiClient.post('/api/customers', data),
  search: (query) => apiClient.get(`/api/customers/search?q=${query}`),
  getAll: () => apiClient.get('/api/customers'),
  getById: (id) => apiClient.get(`/api/customers/${id}`)
};

// Customer Log Services
export const customerLogService = {
  getAll: () => apiClient.get('/api/customer-logs'),
  getPurchaseHistory: (customerId) => apiClient.get(`/api/customer-logs/${customerId}`),
  getTopCustomers: (limit = 10) => apiClient.get('/api/customer-logs/top', { params: { limit } }),
  getRepeatCustomers: () => apiClient.get('/api/customer-logs/repeat'),
  getPurchaseTrends: (customerId, days = 90) => apiClient.get(`/api/customer-logs/${customerId}/trends`, { params: { days } }),
  getCustomerPreferences: (customerId) => apiClient.get(`/api/customer-logs/${customerId}/preferences`),
  search: (term) => apiClient.get('/api/customer-logs/search', { params: { term } }),
  getAcquisitionTrends: () => apiClient.get('/api/customer-logs/acquisition-trends')
};

// System Log Services
export const systemLogService = {
  getAll: (params) => apiClient.get('/api/system-logs', { params }),
  logAction: (data) => apiClient.post('/api/system-logs', data),
  getByDateRange: (startDate, endDate) => apiClient.get('/api/system-logs/date-range', { params: { startDate, endDate } }),
  getByEntity: (entityId) => apiClient.get(`/api/system-logs/entity/${entityId}`),
  getByUser: (userId) => apiClient.get(`/api/system-logs/user/${userId}`),
  getByBranch: (branchId) => apiClient.get(`/api/system-logs/branch/${branchId}`),
  getStats: () => apiClient.get('/api/system-logs/stats'),
  getActionBreakdown: () => apiClient.get('/api/system-logs/action-breakdown'),
  getEntityBreakdown: () => apiClient.get('/api/system-logs/entity-breakdown'),
  getErrors: (limit = 50) => apiClient.get('/api/system-logs/errors', { params: { limit } }),
  getHealthSummary: () => apiClient.get('/api/system-logs/health-summary')
};

// Analytics Services
export const analyticsService = {
  getDashboardAnalytics: (days = 30) => apiClient.get('/api/analytics/dashboard', { params: { days } }),
  getSalesReport: (startDate, endDate, branchId) => apiClient.get('/api/analytics/sales-report', { params: { startDate, endDate, branchId } }),
  getInventoryReport: (branchId) => apiClient.get('/api/analytics/inventory-report', { params: { branchId } }),
  getProductPerformance: (days = 30) => apiClient.get('/api/analytics/product-performance', { params: { days } }),
  getCustomerSegmentation: () => apiClient.get('/api/analytics/customer-segmentation'),
  getTransferAnalytics: (days = 30) => apiClient.get('/api/analytics/transfer-analytics', { params: { days } }),
  getKPIs: (days = 30) => apiClient.get('/api/analytics/kpis', { params: { days } })
};

const apiServices = {
  authService,
  branchService,
  itemService,
  entryTemplateService,
  inventoryService,
  transferService,
  receiptService,
  customerService,
  customerLogService,
  systemLogService,
  analyticsService
};

// Convenience exports for direct api calls
export const api = {
  // Item operations
  getItems: (page = 1) => apiClient.get('/api/items', { params: { page } }),
  getItemById: (id) => apiClient.get(`/api/items/${id}`),
  createItem: (data) => apiClient.post('/api/items', data),
  updateItem: (id, data) => apiClient.put(`/api/items/${id}`, data),
  deactivateItem: (id) => apiClient.delete(`/api/items/${id}`),
  searchItems: (query, category) => apiClient.get('/api/items/search', { params: { q: query, category } }),
  getItemStats: (id) => apiClient.get(`/api/items/${id}/stats`),

  // Branch operations
  getBranches: (page = 1) => apiClient.get('/api/branches', { params: { page } }),
  getBranchById: (id) => apiClient.get(`/api/branches/${id}`),
  createBranch: (data) => apiClient.post('/api/branches', data),
  updateBranch: (id, data) => apiClient.put(`/api/branches/${id}`, data),
  deactivateBranch: (id) => apiClient.delete(`/api/branches/${id}`),
  searchBranches: (query) => apiClient.get('/api/branches/search', { params: { q: query } }),
  getBranchStats: (id) => apiClient.get(`/api/branches/${id}/stats`),
};

export default apiServices;
