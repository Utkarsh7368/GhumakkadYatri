import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import Loader from './Loader';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0,
        hasNext: false,
        hasPrev: false
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [pagination.currentPage]);

    const fetchBookings = async (page = 1) => {
        try {
            setLoading(true);
            const response = await bookingService.getUserBookings(page, 10);
            
            if (response.status === 'success') {
                setBookings(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch bookings');
            console.error('Fetch bookings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking || !cancellationReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            setCancelling(true);
            const response = await bookingService.cancelBooking(
                selectedBooking._id, 
                cancellationReason
            );
            
            if (response.status === 'success') {
                toast.success('Booking cancelled successfully');
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancellationReason('');
                fetchBookings(pagination.currentPage); // Refresh current page
            }
        } catch (error) {
            toast.error(error.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    const openCancelModal = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancellationReason('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
                <Link 
                    to="/packages" 
                    className="btn-primary"
                >
                    Book New Package
                </Link>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
                    <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
                    <Link to="/packages" className="btn-primary">
                        Browse Packages
                    </Link>
                </div>
            ) : (
                <>
                    {/* Bookings Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => {
                            const bookingStatus = bookingService.formatBookingStatus(booking.bookingStatus);
                            const paymentStatus = bookingService.formatPaymentStatus(booking.paymentStatus);
                            
                            return (
                                <div key={booking._id} className="card bg-white border hover:shadow-lg transition-shadow">
                                    {/* Package Image */}
                                    {booking.packageId?.image_url && (
                                        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                            <img
                                                src={booking.packageId.image_url}
                                                alt={booking.packageId.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="p-6">
                                        {/* Package Title */}
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {booking.packageId?.title || 'Package Details'}
                                        </h3>
                                        
                                        {/* Booking Info */}
                                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                                            <div className="flex justify-between">
                                                <span>Travel Date:</span>
                                                <span className="font-medium">{formatDate(booking.travelDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Travelers:</span>
                                                <span className="font-medium">{booking.travelers}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Amount:</span>
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(booking.totalAmount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Booked On:</span>
                                                <span>{formatDate(booking.createdAt)}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bookingStatus.bgColor} ${bookingStatus.textColor}`}>
                                                {bookingStatus.text}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.bgColor} ${paymentStatus.textColor}`}>
                                                {paymentStatus.text}
                                            </span>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Link 
                                                to={`/booking-details/${booking._id}`}
                                                className="flex-1 btn-secondary text-center text-sm"
                                            >
                                                View Details
                                            </Link>
                                            
                                            {booking.bookingStatus === 'pending' && (
                                                <button
                                                    onClick={() => openCancelModal(booking)}
                                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            
                                            {booking.paymentStatus === 'pending' && booking.bookingStatus === 'pending' && (
                                                <Link
                                                    to={`/payment/${booking._id}`}
                                                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    Pay Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                            >
                                Previous
                            </button>
                            
                            {[...Array(pagination.totalPages)].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-lg ${
                                            page === pagination.currentPage
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Booking Statistics */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{pagination.totalBookings}</div>
                            <div className="text-blue-700">Total Bookings</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {bookings.filter(b => b.bookingStatus === 'confirmed').length}
                            </div>
                            <div className="text-green-700">Confirmed</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {bookings.filter(b => b.bookingStatus === 'pending').length}
                            </div>
                            <div className="text-yellow-700">Pending</div>
                        </div>
                    </div>
                </>
            )}

            {/* Cancel Booking Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Cancel Booking
                        </h3>
                        
                        {selectedBooking && (
                            <div className="mb-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">
                                    <strong>Package:</strong> {selectedBooking.packageId?.title}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Travel Date:</strong> {formatDate(selectedBooking.travelDate)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}
                                </p>
                                
                                {/* Refund Information */}
                                {(() => {
                                    const refundInfo = bookingService.calculateRefundAmount(
                                        selectedBooking.totalAmount,
                                        selectedBooking.travelDate
                                    );
                                    return (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-xs text-yellow-800">
                                                <strong>Refund Policy:</strong> {refundInfo.policy}
                                            </p>
                                            <p className="text-xs text-yellow-800">
                                                <strong>Refund Amount:</strong> {formatCurrency(refundInfo.refundAmount)}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Cancellation *
                            </label>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                rows="3"
                                className="input-field"
                                placeholder="Please provide a reason for cancellation..."
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeCancelModal}
                                className="btn-secondary"
                                disabled={cancelling}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                disabled={cancelling || !cancellationReason.trim()}
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;