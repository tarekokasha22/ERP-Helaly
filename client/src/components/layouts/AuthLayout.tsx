import React, { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <img
              className="h-20 w-auto mx-auto logo"
              src="/logo2.webp"
              alt="شعار الهلالي - Helaly Logo"
              style={{ 
                maxWidth: '200px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
              onError={(e) => {
                // Fallback to PNG logo if webp fails to load
                e.currentTarget.src = "/logo.png";
              }}
            />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              شركة الهلالي للمقاولات
            </h2>
            <h3 className="text-lg font-semibold text-orange-600 mb-1">
              Helaly Construction Company
            </h3>
            <p className="text-sm text-gray-600">
              نظام إدارة المشاريع والمقاولات | Project Management System
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 