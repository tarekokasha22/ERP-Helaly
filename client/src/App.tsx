import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CountryProvider } from './contexts/CountryContext';
import { ToastContainer } from 'react-toastify';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectEdit from './pages/ProjectEdit';
import Sections from './pages/Sections';
import SectionDetails from './pages/SectionDetails';
import SectionEdit from './pages/SectionEdit';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Employees from './pages/Employees';
import Payments from './pages/Payments';
import AIChat from './pages/AIChat';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <CountryProvider>
          <AppContent />
        </CountryProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
};

// Separate component to access language context
const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  // 🔒 أثناء التحميل، عرض شاشة التحميل بدلاً من التوجيه المباشر
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    console.log('🔍 ProtectedRoute check - isAuthenticated:', isAuthenticated, 'user:', user?.name);
    if (!isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }
    return <>{children}</>;
  };

  // If user is already authenticated and tries to access login page, redirect them to dashboard
  const LoginRoute = () => {
    console.log('🔍 LoginRoute check - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    console.log('🔒 User not authenticated, showing login page');
    return (
      <AuthLayout>
        <Login />
      </AuthLayout>
    );
  };

  return (
    <>
      <Routes>
        {/* Route للصفحة الرئيسية وتسجيل الدخول */}
        <Route path="/login" element={<LoginRoute />} />
        <Route 
          path="/" 
          element={
            (() => {
              console.log('🔍 Root route check - isAuthenticated:', isAuthenticated);
              if (isAuthenticated) {
                console.log('✅ Authenticated, redirecting to dashboard');
                return <Navigate to="/dashboard" replace />;
              } else {
                console.log('🔒 Not authenticated, redirecting to login');
                return <Navigate to="/login" replace />;
              }
            })()
          } 
        />

        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="projects/:id/edit" element={
            <AdminRoute>
              <ProjectEdit />
            </AdminRoute>
          } />
          <Route path="sections" element={<Sections />} />
          <Route path="sections/:id" element={<SectionDetails />} />
          <Route path="sections/:id/edit" element={
            <AdminRoute>
              <SectionEdit />
            </AdminRoute>
          } />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="employees" element={<Employees />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai-chat" element={<AIChat />} />
          
          {/* Admin-only routes */}
          <Route path="users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      {/* Toast notifications container with RTL support */}
      <ToastContainer
        position={isRtl ? "top-left" : "top-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={isRtl}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App; 