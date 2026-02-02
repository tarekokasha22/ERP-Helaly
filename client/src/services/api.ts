import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

// API Configuration: في التطوير استخدم /api (يُوجّه عبر proxy للسيرفر). تأكد تشغيل السيرفر أولاً.
const API_URL = process.env.REACT_APP_API_URL || '/api';
const TIMEOUT = 15000; // 15 seconds

// Create Axios instance with enhanced configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and country headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add country header for additional validation
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.country) {
          config.headers['X-User-Country'] = user.country;
        }
      } catch (error) {
        console.warn('Failed to parse user data for country header:', error);
      }
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
// ⚠️ IMPORTANT: NO AUTO-REDIRECT on 401! Let components handle errors.
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        message: response?.data?.message || error.message
      });
    }

    // ⚠️ REMOVED: Auto-redirect and token deletion on 401
    // Let the application handle authentication flow

    return Promise.reject(error);
  }
);

// Enhanced API service with better typing and error handling
const api = {
  // Expose the axios instance for advanced usage
  instance: axiosInstance,

  // Add common headers (for backward compatibility)
  defaults: {
    headers: {
      common: axiosInstance.defaults.headers.common as Record<string, string>
    }
  },

  // Health check
  async healthCheck(): Promise<{ data: any }> {
    return await axiosInstance.get('/health');
  },

  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    try {
      return await axiosInstance.get<T>(url, config);
    } catch (error) {
      console.error(`API GET Error (${url}):`, error);
      throw error;
    }
  },

  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axiosInstance.post<T>(url, data, config);
    } catch (error) {
      console.error(`API POST Error (${url}):`, error);
      throw error;
    }
  },

  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axiosInstance.put<T>(url, data, config);
    } catch (error) {
      console.error(`API PUT Error (${url}):`, error);
      throw error;
    }
  },

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axiosInstance.delete<T>(url, config);
    } catch (error) {
      console.error(`API DELETE Error (${url}):`, error);
      throw error;
    }
  },

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axiosInstance.patch<T>(url, data, config);
    } catch (error) {
      console.error(`API PATCH Error (${url}):`, error);
      throw error;
    }
  },

  // Utility methods

  // Set auth token
  setAuthToken(token: string) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Remove auth token
  removeAuthToken() {
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  // Set country header
  setCountryHeader(country: 'egypt' | 'libya') {
    axiosInstance.defaults.headers.common['X-User-Country'] = country;
  },

  // Remove country header
  removeCountryHeader() {
    delete axiosInstance.defaults.headers.common['X-User-Country'];
  }
};

export default api;