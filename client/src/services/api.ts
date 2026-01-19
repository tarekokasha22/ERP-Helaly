import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 10000; // 10 seconds

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add country header for additional validation
    const userData = localStorage.getItem('user');
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
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const { response, request, config } = error;
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        message: response?.data?.message || error.message
      });
    }
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      const isAuthEndpoint = config?.url?.includes('/auth/');
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (!isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Session expired. Please log in again.');
          }
          break;
          
        case 403:
          // Forbidden - access denied
          if (!isAuthEndpoint) {
            toast.error('Access denied. You do not have permission for this action.');
          }
          break;
          
        case 404:
          // Not found
          if (!isAuthEndpoint) {
            toast.error('Resource not found.');
          }
          break;
          
        case 422:
          // Validation error
          const message = data?.message || 'Validation error occurred.';
          if (!isAuthEndpoint) {
            toast.error(message);
          }
          break;
          
        case 500:
          // Server error
          if (!isAuthEndpoint) {
            toast.error('Server error. Please try again later.');
          }
          break;
          
        default:
          // Other errors
          const errorMessage = data?.message || `Error ${status} occurred.`;
          if (!isAuthEndpoint) {
            toast.error(errorMessage);
          }
      }
    } else if (request) {
      // Network error - no response received
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Request setup error
      toast.error('Request configuration error. Please try again.');
    }
    
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