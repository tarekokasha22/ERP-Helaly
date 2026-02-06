import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/apiService';

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
  loginDirect: (country: 'egypt' | 'libya') => Promise<void>;
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

  useEffect(() => {
    // Load user from sessionStorage on mount
    const loadUser = () => {
      console.log('🔍 Loading user from sessionStorage...');

      const savedUser = sessionStorage.getItem('user');
      const savedToken = sessionStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          const userData = JSON.parse(savedUser) as User;
          setUser(userData);

          // Set API headers
          api.setAuthToken(savedToken);
          api.setCountryHeader(userData.country);

          console.log('✅ User loaded:', userData.name);
        } catch (error) {
          console.error('❌ Failed to load user:', error);
          setUser(null);
        }
      } else {
        console.log('🔒 No saved user found');
        setUser(null);
      }

      setIsLoading(false);
    };

    // Small delay to ensure sessionStorage is ready
    setTimeout(loadUser, 50);
  }, []);

  // Login with password (legacy)
  const login = async (username: string, password: string, country: 'egypt' | 'libya') => {
    console.log('🔐 Login attempt:', username, country);

    // Create user directly without API call
    const userData: User = {
      id: `admin_${country}_001`,
      name: country === 'egypt' ? 'مدير مصر' : 'مدير ليبيا',
      username: username,
      role: 'admin',
      country: country,
    };

    const token = `direct-access-${country}-${Date.now()}`;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('selectedCountry', country);

    api.setAuthToken(token);
    api.setCountryHeader(country);

    setUser(userData);
    console.log('✅ Login successful:', userData.name);
  };

  // Direct login - just select country
  const loginDirect = async (country: 'egypt' | 'libya') => {
    console.log('🚀 Direct login for:', country);

    const userData: User = {
      id: `admin_${country}_001`,
      name: country === 'egypt' ? 'مدير مصر' : 'مدير ليبيا',
      username: 'admin',
      email: `admin@${country}.com`,
      role: 'admin',
      country: country,
    };

    const token = `direct-access-${country}-${Date.now()}`;

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('selectedCountry', country);

    api.setAuthToken(token);
    api.setCountryHeader(country);

    setUser(userData);
    console.log('✅ Direct login successful:', userData.name);
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('selectedCountry');
    api.removeAuthToken();
    api.removeCountryHeader();
    setUser(null);

    // Reload to show country selector
    window.location.href = '/';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginDirect,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};