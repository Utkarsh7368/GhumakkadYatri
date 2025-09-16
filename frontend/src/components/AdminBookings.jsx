import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import Loader from './Loader';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0,
        hasNext: false,
        hasPrev: false
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [filters.page, filters.status, filters.paymentStatus]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { page, limit, ...filterParams } = filters;
            
            // Remove empty filters
            const cleanFilters = Object.fromEntries(
                Object.entries(filterParams).filter(([key, value]) => value !== '')
            );
            
            const response = await bookingService.getAllBookings(page, limit, cleanFilters);
            
            if (response.status === 'success') {
                setBookings(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch bookings');
            console.error('Fetch admin bookings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            paymentStatus: '',
            page: 1,
            limit: 10
        });
    };

    const showBookingDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading && bookings.length === 0) {
        return <Loader />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">All Bookings</h1>
                    <p className="text-gray-600">Manage and monitor all customer bookings</p>
                </div>
                <Link to="/admin/booking-stats" className="btn-primary">
                    View Statistics
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Status
                        </label>
                        <select
                            value={filters.paymentStatus}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Payments</option>
                            <option value="pending">Pending</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Items per page
                        </label>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            className="input-field"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="btn-secondary w-full"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                
                {/* Filter Summary */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {filters.status && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            Status: {filters.status}
                        </span>
                    )}
                    {filters.paymentStatus && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            Payment: {filters.paymentStatus}
                        </span>
                    )}
                </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">
                            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalBookings)} of {pagination.totalBookings} bookings
                        </p>
                    </div>
                    {loading && (
                        <div className="text-sm text-blue-600">Updating...</div>
                    )}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
                        <p className="text-gray-500">No bookings match your current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Booking Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Package
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Travel Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => {
                                    const bookingStatus = bookingService.formatBookingStatus(booking.bookingStatus);
                                    const paymentStatus = bookingService.formatPaymentStatus(booking.paymentStatus);
                                    
                                    return (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {booking._id.substring(0, 8)}...
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {formatDateTime(booking.createdAt)}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {booking.userId?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {booking.userId?.email || 'N/A'}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {booking.userId?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {booking.packageId?.title || 'Package Details'}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {booking.packageId?.locations?.slice(0, 2).join(', ')}
                                                        {booking.packageId?.locations?.length > 2 && '...'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(booking.travelDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(booking.totalAmount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bookingStatus.bgColor} ${bookingStatus.textColor}`}>
                                                        {bookingStatus.text}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatus.bgColor} ${paymentStatus.textColor}`}>
                                                        {paymentStatus.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => showBookingDetails(booking)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    >
                        Previous
                    </button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        const page = Math.max(1, pagination.currentPage - 2) + index;
                        if (page > pagination.totalPages) return null;
                        
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

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Booking Details
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div><strong>Booking ID:</strong> {selectedBooking._id}</div>
                                    <div><strong>Customer:</strong> {selectedBooking.userId?.name}</div>
                                    <div><strong>Email:</strong> {selectedBooking.userId?.email}</div>
                                    <div><strong>Phone:</strong> {selectedBooking.userId?.phone}</div>
                                    <div><strong>Package:</strong> {selectedBooking.packageId?.title}</div>
                                    <div><strong>Travel Date:</strong> {formatDate(selectedBooking.travelDate)}</div>
                                    <div><strong>Travelers:</strong> {selectedBooking.travelers}</div>
                                    <div><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</div>
                                    <div><strong>Booking Date:</strong> {formatDateTime(selectedBooking.createdAt)}</div>
                                </div>
                            </div>
                            
                            {/* Status and Payment */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Status & Payment</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <strong>Booking Status:</strong>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${bookingService.formatBookingStatus(selectedBooking.bookingStatus).bgColor} ${bookingService.formatBookingStatus(selectedBooking.bookingStatus).textColor}`}>
                                            {bookingService.formatBookingStatus(selectedBooking.bookingStatus).text}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Payment Status:</strong>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${bookingService.formatPaymentStatus(selectedBooking.paymentStatus).bgColor} ${bookingService.formatPaymentStatus(selectedBooking.paymentStatus).textColor}`}>
                                            {bookingService.formatPaymentStatus(selectedBooking.paymentStatus).text}
                                        </span>
                                    </div>
                                    {selectedBooking.paymentDetails?.paymentMethod && (
                                        <div><strong>Payment Method:</strong> {selectedBooking.paymentDetails.paymentMethod}</div>
                                    )}
                                    {selectedBooking.paymentDetails?.transactionId && (
                                        <div><strong>Transaction ID:</strong> {selectedBooking.paymentDetails.transactionId}</div>
                                    )}
                                    {selectedBooking.paymentDetails?.paymentDate && (
                                        <div><strong>Payment Date:</strong> {formatDateTime(selectedBooking.paymentDetails.paymentDate)}</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Traveler Details */}
                            {selectedBooking.travelerDetails && selectedBooking.travelerDetails.length > 0 && (
                                <div className="md:col-span-2">
                                    <h4 className="font-semibold text-gray-800 mb-3">Traveler Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedBooking.travelerDetails.map((traveler, index) => (
                                            <div key={index} className="border rounded p-3 bg-gray-50">
                                                <div className="font-medium mb-2">Traveler {index + 1}</div>
                                                <div className="text-sm space-y-1">
                                                    <div><strong>Name:</strong> {traveler.name}</div>
                                                    <div><strong>Age:</strong> {traveler.age}</div>
                                                    <div><strong>Gender:</strong> {traveler.gender}</div>
                                                    {traveler.phone && <div><strong>Phone:</strong> {traveler.phone}</div>}
                                                    {traveler.email && <div><strong>Email:</strong> {traveler.email}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Special Requests */}
                            {selectedBooking.specialRequests && (
                                <div className="md:col-span-2">
                                    <h4 className="font-semibold text-gray-800 mb-3">Special Requests</h4>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                        {selectedBooking.specialRequests}
                                    </p>
                                </div>
                            )}
                            
                            {/* Cancellation Details */}
                            {selectedBooking.cancellationDetails?.cancelledAt && (
                                <div className="md:col-span-2">
                                    <h4 className="font-semibold text-red-800 mb-3">Cancellation Details</h4>
                                    <div className="bg-red-50 border border-red-200 rounded p-3">
                                        <div className="text-sm space-y-1">
                                            <div><strong>Cancelled On:</strong> {formatDateTime(selectedBooking.cancellationDetails.cancelledAt)}</div>
                                            <div><strong>Reason:</strong> {selectedBooking.cancellationDetails.cancellationReason}</div>
                                            <div><strong>Refund Amount:</strong> {formatCurrency(selectedBooking.cancellationDetails.refundAmount || 0)}</div>
                                            <div><strong>Refund Status:</strong> {selectedBooking.cancellationDetails.refundStatus}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;