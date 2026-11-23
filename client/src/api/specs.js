// All API calls related to cocktail specs, in one place.
import { apiRequest } from './client.js';

// GET /api/specs?search=...&category=...
export function getSpecs({ search = '', category = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const queryString = params.toString();
  return apiRequest(`/specs${queryString ? `?${queryString}` : ''}`);
}

export const getSpec = (id) => apiRequest(`/specs/${id}`);
export const getSpecHistory = (id) => apiRequest(`/specs/${id}/history`);
export const createSpec = (spec) => apiRequest('/specs', { method: 'POST', body: spec });
export const updateSpec = (id, spec) => apiRequest(`/specs/${id}`, { method: 'PUT', body: spec });
export const deleteSpec = (id) => apiRequest(`/specs/${id}`, { method: 'DELETE' });
