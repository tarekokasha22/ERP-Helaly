import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginDirect } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<'egypt' | 'libya' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!selectedCountry) {
      setError('الرجاء اختيار الدولة');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginDirect(selectedCountry);
      navigate('/dashboard');
    } catch (err) {
      setError('حدث خطأ أثناء الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl text-white font-bold">H</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">نظام الهلالي ERP</h1>
            <p className="text-gray-500">Helaly Construction Management</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">اختر الفرع</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Country Selection */}
          <div className="space-y-3 mb-6">
            {/* Egypt */}
            <button
              type="button"
              onClick={() => setSelectedCountry('egypt')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                ${selectedCountry === 'egypt'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}
            >
              <span className="text-4xl">🇪🇬</span>
              <div className="text-right flex-1">
                <span className="text-xl font-bold text-gray-800">مصر</span>
                <p className="text-gray-400 text-sm">Egypt Branch</p>
              </div>
              {selectedCountry === 'egypt' && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Libya */}
            <button
              type="button"
              onClick={() => setSelectedCountry('libya')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                ${selectedCountry === 'libya'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}
            >
              <span className="text-4xl">🇱🇾</span>
              <div className="text-right flex-1">
                <span className="text-xl font-bold text-gray-800">ليبيا</span>
                <p className="text-gray-400 text-sm">Libya Branch</p>
              </div>
              {selectedCountry === 'libya' && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!selectedCountry || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
              ${selectedCountry && !isLoading
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الدخول...</span>
              </div>
            ) : (
              'دخول'
            )}
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-sm">© 2026 Helaly Construction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
