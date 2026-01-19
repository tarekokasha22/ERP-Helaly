import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { clearAllAuthData } from '../utils/authUtils';
import { useForm } from 'react-hook-form';

type LoginFormValues = {
  username: string;
  password: string;
  country: 'egypt' | 'libya';
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, t, dir } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', data.username, 'Country:', data.country);
      await login(data.username, data.password, data.country);
      console.log('✅ Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(t('login', 'errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 Helper function for clearing data in case of issues
  const handleClearData = () => {
    console.log('🧹 Manual data clear requested');
    clearAllAuthData();
    toast.success('تم مسح جميع البيانات المحفوظة');
    window.location.reload();
  };



  return (
    <div className="mt-8" dir={dir()}>
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {/* Country Selection */}
        <div className="mb-6">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country / البلد
          </label>
          <select
            id="country"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${errors.country ? 'border-red-500' : ''}`}
            {...register('country', { required: 'Please select a country' })}
          >
            <option value="">Select Country</option>
            <option value="egypt">🇪🇬 Egypt / مصر</option>
            <option value="libya">🇱🇾 Libya / ليبيا</option>
          </select>
          {errors.country && (
            <p className="mt-2 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username / اسم المستخدم
            </label>
            <div className="mt-1">
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${errors.username ? 'border-red-500' : ''}`}
                {...register('username', { 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                })}
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('login', 'password')}
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', { 
                  required: t('login', 'passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('login', 'passwordTooShort')
                  }
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {isLoading ? t('login', 'loading') : t('login', 'loginButton')}
            </button>
          </div>
        </form>

        {/* 🔧 Development tools for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">أدوات التطوير</p>
            <button
              type="button"
              onClick={handleClearData}
              className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🧹 مسح جميع البيانات المحفوظة
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              استخدم هذا الزر إذا كنت تواجه مشاكل في تسجيل الدخول
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 