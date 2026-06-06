/**
 * 🔒 AUTHENTICATION UTILITIES
 * Helper functions for managing authentication state and security
 */

/**
 * مسح جميع بيانات المصادقة من localStorage
 * Clear all authentication data from localStorage
 */
export const clearAllAuthData = (): void => {
  console.log('🧹 Clearing all authentication data...');

  // مسح بيانات المصادقة
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // مسح أي بيانات أخرى قد تكون مخزنة
  const keysToRemove = [
    'helaly_current_user',
    'helaly_session',
    'auth_session',
    'user_session'
  ];

  keysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    }
  });

  console.log('✅ All authentication data cleared');
};

export const getToken = (): string | null => {
  return sessionStorage.getItem('token');
};

export const getUser = (): any | null => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');
  return !!token && !!user;
};

/**
 * التحقق من وجود بيانات مصادقة صالحة
 * Check if valid authentication data exists
 */
export const hasValidAuthData = (): boolean => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');

  if (!token || !user) {
    return false;
  }

  try {
    // التحقق من تنسيق التوكين
    if (token.length < 10) {
      return false;
    }

    // التحقق من بيانات المستخدم
    const userData = JSON.parse(user);
    if (!userData.id || !userData.name) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Invalid auth data format:', error);
    return false;
  }
};

/**
 * إعادة تعيين التطبيق لحالة نظيفة
 * Reset application to clean state
 */
export const resetAppState = (): void => {
  console.log('🔄 Resetting application state...');

  // مسح جميع بيانات المصادقة
  clearAllAuthData();

  // إعادة تحميل الصفحة للبدء من جديد
  window.location.href = '/login';

  console.log('✅ Application state reset complete');
};

/**
 * فحص أمان شامل للتطبيق
 * Comprehensive security check for the application
 */
export const performSecurityCheck = (): {
  isSecure: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // فحص localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && !token.startsWith('mock-jwt-token-') && process.env.NODE_ENV === 'development') {
    issues.push('Invalid development token format');
    recommendations.push('Clear localStorage and restart application');
  }

  if (user) {
    try {
      const userData = JSON.parse(user);
      if (!userData.id || !userData.name || !userData.country) {
        issues.push('Incomplete user data');
        recommendations.push('Re-authenticate user');
      }
    } catch (error) {
      issues.push('Corrupted user data in localStorage');
      recommendations.push('Clear localStorage and re-login');
    }
  }

  // فحص بيانات متضاربة
  if (token && !user) {
    issues.push('Token exists without user data');
    recommendations.push('Clear authentication data');
  }

  if (!token && user) {
    issues.push('User data exists without token');
    recommendations.push('Clear authentication data');
  }

  const isSecure = issues.length === 0;

  console.log('🔍 Security check complete:', {
    isSecure,
    issuesFound: issues.length,
    issues,
    recommendations
  });

  return { isSecure, issues, recommendations };
};

/**
 * تنظيف تلقائي لبيانات المصادقة في وضع التطوير
 * Automatic cleanup of authentication data in development mode
 */
export const developmentCleanup = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Performing automatic cleanup...');

    const securityCheck = performSecurityCheck();

    if (!securityCheck.isSecure) {
      console.warn('⚠️ Security issues detected:', securityCheck.issues);
      console.log('🔧 Applying automatic fixes...');
      clearAllAuthData();
      console.log('✅ Development cleanup complete');
    } else {
      console.log('✅ No security issues detected');
    }
  }
};
