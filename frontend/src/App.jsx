import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { FullPageLoader } from './components/Loader';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Packages = React.lazy(() => import('./pages/Packages'));
const PackageDetails = React.lazy(() => import('./pages/PackageDetails'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const UserBookingManagement = React.lazy(() => import('./pages/UserBookingManagement'));
const AdminBookingManagement = React.lazy(() => import('./pages/AdminBookingManagement'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <FullPageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Suspense fallback={<FullPageLoader message="Loading page..." />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin route - protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin booking management - protected */}
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute>
                  <AdminBookingManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* User booking management - protected */}
            <Route 
              path="/my-bookings" 
              element={
                <ProtectedRoute>
                  <UserBookingManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Booking routes for users */}
            <Route 
              path="/book/:packageId" 
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  );
}

// Simple 404 component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <a href="/" className="btn-primary">
        Go back home
      </a>
    </div>
  </div>
);

export default App;