import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingStats from '../components/BookingStats';
import AdminBookings from '../components/AdminBookings';
import Loader from '../components/Loader';

const AdminBookingManagement = () => {
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is admin
        if (isAuthenticated && user) {
            if (user.role !== 'admin') {
                // Redirect non-admin users
                window.location.href = '/';
                return;
            }
            setLoading(false);
        } else if (isAuthenticated === false) {
            // Redirect unauthenticated users
            window.location.href = '/login';
            return;
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        // Set active tab based on URL params
        const tab = searchParams.get('tab');
        if (tab && ['stats', 'bookings'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
                    <Link to="/" className="btn-primary">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'stats',
            name: 'Statistics',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            description: 'View booking statistics and insights'
        },
        {
            id: 'bookings',
            name: 'All Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
            ),
            description: 'Manage all customer bookings'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage bookings and view business insights
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user?.name || user?.email}
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Admin
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6">
                {activeTab === 'stats' && <BookingStats />}
                {activeTab === 'bookings' && <AdminBookings />}
            </div>

            {/* Quick Actions Footer */}
            <div className="fixed bottom-6 right-6">
                <div className="bg-white rounded-lg shadow-lg border p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                        <Link
                            to="/admin/packages"
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span>Add Package</span>
                        </Link>
                        <Link
                            to="/admin/bookings?status=pending"
                            className="flex items-center space-x-2 text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Pending Bookings</span>
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingManagement;