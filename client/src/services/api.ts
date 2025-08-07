import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:5000/api';

// Types pour standardiser les réponses API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  token?: string;
}

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

// Helper function to extract data safely from API responses
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  console.warn('API Response has unexpected structure:', response);
  return {} as T;
}

// Interface pour les paramètres de filtrage
export interface FilterParams {
  region?: string;
  service?: string;
  minRating?: number;
  maxRate?: number;
  search?: string;
}

// Housekeepers API
export const housekeepersAPI = {
  register: (formData: any) => api.post('/housekeepers', formData),
  
  getAll: async (filters?: FilterParams) => {
    // Construire l'URL avec les paramètres de filtrage si fournis
    let url = '/housekeepers';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.region) params.append('region', filters.region);
      if (filters.service) params.append('service', filters.service);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.maxRate) params.append('maxRate', filters.maxRate.toString());
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await api.get(url);
    return extractData<any[]>(response);
  },
  
  getPending: async () => {
    const response = await api.get('/housekeepers/pending');
    return extractData<any[]>(response);
  },
  
  approve: async (id: number | string) => {
    const response = await api.patch(`/housekeepers/${id}/approve`);
    return extractData<any>(response);
  },
  
  delete: async (id: number | string) => {
    const response = await api.delete(`/housekeepers/${id}`);
    return extractData<any>(response);
  },
};

// Admin API
export const adminAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/admin/login', credentials);
    // Store token if present in response
    if (response?.data?.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },
};

// Health Check
export const healthCheck = () => api.get('/health');

export default api;
