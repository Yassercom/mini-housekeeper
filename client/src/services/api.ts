import axios, { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types pour standardiser les réponses API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;       // Nombre d'éléments dans data
  total?: number;       // Nombre total d'éléments (pour pagination)
  page?: number;        // Page actuelle
  limit?: number;       // Nombre d'éléments par page
  totalPages?: number;  // Nombre total de pages
  token?: string;       // Token JWT (pour login)
  errorCode?: string;   // Code d'erreur éventuel
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
function extractData<T>(response: AxiosResponse<ApiResponse<T>>) {
  if (response?.data) {
    // Return a standardized format with pagination information if available
    return {
      data: response.data.data || [],
      message: response.data.message,
      success: response.data.success,
      count: response.data.count || 0,
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || 1
    };
  }
  console.warn('API Response has unexpected structure:', response);
  return {
    data: [] as unknown as T,
    message: 'Erreur lors de la récupération des données',
    success: false,
    count: 0,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };
}

// Interface pour les paramètres de filtrage
export interface FilterParams {
  region?: string;
  service?: string;
  minRating?: number;
  maxRate?: number;
  search?: string;
  status?: string;      // 'pending', 'approved', 'rejected', ''
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Housekeepers API
export const housekeepersAPI = {
  register: (formData: any) => api.post('/housekeepers', formData),
  
  getAll: async (filters?: FilterParams, token?: string) => {
    // Construire l'URL avec les paramètres de filtrage si fournis
    let url = '/housekeepers';
    if (filters) {
      const params = new URLSearchParams();
      // N'ajouter region que si elle n'est pas vide
      if (filters.region && filters.region.trim() !== '') params.append('region', filters.region);
      if (filters.service) params.append('service', filters.service);
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.maxRate) params.append('maxRate', filters.maxRate.toString());
      if (filters.search) params.append('search', filters.search);
      // Utiliser le status par défaut 'approved' si non spécifié
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    // Si un token est fourni, l'utiliser pour cette requête spécifique
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    
    const response = await api.get(url, { headers });
    return extractData(response);
  },
  
  getPending: async (token?: string) => {
    // Redirige vers getAll avec le filtre status=pending
    return housekeepersAPI.getAll({ status: 'pending' }, token);
  },
  
  approve: async (id: number | string, token?: string) => {
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    const response = await api.patch(`/housekeepers/${id}/approve`, {}, { headers });
    return response.data;
  },
  
  reject: async (id: number | string, token?: string) => {
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    const response = await api.patch(`/housekeepers/${id}/reject`, {}, { headers });
    return response.data;
  },
  
  delete: async (id: number | string, token?: string) => {
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    const response = await api.delete(`/housekeepers/${id}`, { headers });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/admin/login', credentials);
      
      // Vérifier que la réponse contient un token (structure data.data.token)
      if (response?.data?.success && response?.data?.data?.token) {
        // Stocker le token dans localStorage
        localStorage.setItem('adminToken', response.data.data.token);
        return { 
          success: true, 
          message: response.data.message || 'Connexion réussie', 
          token: response.data.data.token 
        };
      } else {
        // Pas de token malgré une réponse 200 - considérer comme échec
        console.warn('Login API response structure invalid:', response.data);
        return { 
          success: false, 
          message: response.data.message || 'Erreur d\'authentification: structure de réponse incorrecte', 
          errorCode: 'INVALID_RESPONSE_STRUCTURE' 
        };
      }
    } catch (error: any) {
      // Extract error message from response if available
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      const errorCode = error.response?.data?.errorCode || 'LOGIN_ERROR';
      return { success: false, message, errorCode };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    return { success: true, message: 'Déconnexion réussie' };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  getToken: () => {
    return localStorage.getItem('adminToken');
  }
};

// Health Check
export const healthCheck = () => api.get('/health');

export default api;
