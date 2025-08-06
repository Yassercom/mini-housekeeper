import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Housekeepers API
export const housekeepersAPI = {
  register: (formData: any) => api.post('/housekeepers', formData),
  getAll: () => api.get('/housekeepers'),
  getPending: () => api.get('/housekeepers/pending'),
  approve: (id: number | string) => api.patch(`/housekeepers/${id}/approve`),
  delete: (id: number | string) => api.delete(`/housekeepers/${id}`),
};

// Admin API
export const adminAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/admin/login', credentials),
};

// Health Check
export const healthCheck = () => api.get('/health');

export default api;
