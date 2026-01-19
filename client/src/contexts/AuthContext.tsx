import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { mockLogin, mockGetUserProfile } from '../services/mockApi';
import { clearAllAuthData, developmentCleanup, performSecurityCheck } from '../utils/authUtils';

// Flag to use mock API for development
const USE_MOCK_API = true;

type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  position?: string;
  country: 'egypt' | 'libya';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, country: 'egypt' | 'libya') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 SECURITY INITIALIZATION: التنظيف والفحص الأمني عند بدء التطبيق
  useEffect(() => {
    console.log('🔒 Starting authentication security initialization...');
    
    if (USE_MOCK_API && process.env.NODE_ENV === 'development') {
      // في وضع التطوير، تنظيف تلقائي
      developmentCleanup();
      clearAllAuthData();
      setUser(null);
    } else {
      // في وضع الإنتاج، فحص أمني شامل
      const securityCheck = performSecurityCheck();
      
      if (!securityCheck.isSecure) {
        console.warn('⚠️ Security issues detected in production mode:', securityCheck.issues);
        clearAllAuthData();
        setUser(null);
      }
    }
    
    console.log('✅ Authentication security initialization complete');
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      // 🔒 في وضع التطوير، ننتظر قليلاً للتأكد من مسح البيانات أولاً
      if (USE_MOCK_API && process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 200));
        // في وضع التطوير، نبدأ دائماً بدون مصادقة
        console.log('🔒 Development mode: Starting without authentication');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log('🔍 Checking authentication, token exists:', !!token);
      
      if (token) {
        try {
          if (USE_MOCK_API) {
            // التحقق الصارم من تنسيق التوكين
            if (!token.startsWith('mock-jwt-token-')) {
              throw new Error('Invalid token format');
            }
            const userData = await mockGetUserProfile(token);
            console.log('✅ Authentication successful:', userData.name);
            setUser(userData as User);
          } else {
            // استخدام API حقيقي للإنتاج
            api.setAuthToken(token);
            const response = await api.get('/auth/me');
            
            if (response.data.success) {
              const userData = response.data.user;
              localStorage.setItem('user', JSON.stringify(userData));
              api.setCountryHeader(userData.country);
              console.log('✅ Authentication successful:', userData.name);
              setUser(userData);
            } else {
              throw new Error('Failed to get user profile');
            }
          }
        } catch (error) {
          console.error('❌ Authentication failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!USE_MOCK_API) {
            api.removeAuthToken();
            api.removeCountryHeader();
          }
          setUser(null);
        }
      } else {
        console.log('🔒 No token found, user not authenticated');
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, country: 'egypt' | 'libya') => {
    try {
      if (USE_MOCK_API) {
        // Use mock API for development
        const { token, user } = await mockLogin(username, password, country);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user as User);
      } else {
        // Use real API for production
        const response = await api.post('/auth/login', { username, password, country });
        
        if (response.data.success) {
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          api.setAuthToken(token);
          api.setCountryHeader(country);
          
          setUser(user as User);
        } else {
          throw new Error(response.data.message || 'Login failed');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!USE_MOCK_API) {
      api.removeAuthToken();
      api.removeCountryHeader();
    }
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 