import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MyBookings from '../components/MyBookings';
import BookingDetails from '../components/BookingDetails';
import Loader from '../components/Loader';

const UserBookingManagement = () => {
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        if (isAuthenticated === false) {
            // Redirect unauthenticated users
            window.location.href = '/login';
            return;
        } else if (isAuthenticated && user) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        // Check for booking ID in URL params
        const bookingId = searchParams.get('booking');
        if (bookingId) {
            setSelectedBookingId(bookingId);
        }
    }, [searchParams]);

    const handleViewBooking = (bookingId) => {
        setSelectedBookingId(bookingId);
        // Update URL without page reload
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('booking', bookingId);
        window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
    };

    const handleBackToList = () => {
        setSelectedBookingId(null);
        // Remove booking ID from URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('booking');
        const newUrl = newSearchParams.toString() 
            ? `${window.location.pathname}?${newSearchParams}`
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    };

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-blue-400 text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your bookings.</p>
                    <Link to="/login" className="btn-primary">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View and manage your travel bookings
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {user?.name || user?.email}
                            </div>
                            <Link 
                                to="/packages" 
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Browse Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Breadcrumb */}
            {selectedBookingId && (
                <div className="bg-gray-100 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-4">
                                <li>
                                    <button
                                        onClick={handleBackToList}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                        </svg>
                                        My Bookings
                                    </button>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-4 text-sm font-medium text-gray-900">
                                            Booking Details
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="py-6">
                {selectedBookingId ? (
                    <BookingDetails 
                        bookingId={selectedBookingId} 
                        onBack={handleBackToList}
                    />
                ) : (
                    <MyBookings onViewBooking={handleViewBooking} />
                )}
            </div>

            {/* Help Section */}
            {!selectedBookingId && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-medium text-blue-800 mb-2">Booking Issues</h4>
                                <p className="text-sm text-blue-700 mb-2">
                                    Having trouble with your booking? We're here to help.
                                </p>
                                <Link to="/contact" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Contact Support →
                                </Link>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800 mb-2">Cancellation Policy</h4>
                                <p className="text-sm text-blue-700 mb-2">
                                    Learn about our cancellation terms and refund process.
                                </p>
                                <Link to="/policies" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Policies →
                                </Link>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800 mb-2">Payment Questions</h4>
                                <p className="text-sm text-blue-700 mb-2">
                                    Questions about payments, receipts, or billing?
                                </p>
                                <Link to="/faq" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View FAQ →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions for Empty State */}
            {!selectedBookingId && (
                <div className="fixed bottom-6 right-6">
                    <div className="bg-white rounded-lg shadow-lg border p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                            <Link
                                to="/packages"
                                className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                <span>New Booking</span>
                            </Link>
                            <Link
                                to="/contact"
                                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                                <span>Get Help</span>
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
            )}
        </div>
    );
};

export default UserBookingManagement;