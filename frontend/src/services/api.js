import apiClient from './apiClient';

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

export default {
  branchService,
  itemService,
  entryTemplateService,
  inventoryService,
  receiptService,
  customerService
};
