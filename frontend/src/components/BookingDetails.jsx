import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import Loader from './Loader';

const BookingDetails = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(bookingId);
            
            if (response.status === 'success') {
                setBooking(response.data);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch booking details');
            console.error('Fetch booking details error:', error);
            // Navigate back if booking not found
            setTimeout(() => navigate('/my-bookings'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            setCancelling(true);
            const response = await bookingService.cancelBooking(bookingId, cancellationReason);
            
            if (response.status === 'success') {
                toast.success('Booking cancelled successfully');
                setShowCancelModal(false);
                setCancellationReason('');
                fetchBookingDetails(); // Refresh booking details
            }
        } catch (error) {
            toast.error(error.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
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

    if (loading) {
        return <Loader />;
    }

    if (!booking) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="text-red-400 text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Booking not found</h3>
                    <p className="text-gray-500 mb-6">The booking you're looking for doesn't exist or you don't have access to it.</p>
                    <Link to="/my-bookings" className="btn-primary">
                        Back to My Bookings
                    </Link>
                </div>
            </div>
        );
    }

    const bookingStatus = bookingService.formatBookingStatus(booking.bookingStatus);
    const paymentStatus = bookingService.formatPaymentStatus(booking.paymentStatus);
    const refundInfo = bookingService.calculateRefundAmount(booking.totalAmount, booking.travelDate);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Booking Details</h1>
                    <p className="text-gray-600">Booking ID: {booking._id}</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bookingStatus.bgColor} ${bookingStatus.textColor}`}>
                        {bookingStatus.text}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.textColor}`}>
                        {paymentStatus.text}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Package Information */}
                    <div className="card bg-white">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Package Information</h2>
                        
                        {booking.packageId?.image_url && (
                            <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={booking.packageId.image_url}
                                    alt={booking.packageId.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-800">
                                {booking.packageId?.title || 'Package Details'}
                            </h3>
                            <p className="text-gray-600">
                                {booking.packageId?.description || 'Package description not available'}
                            </p>
                            
                            {booking.packageId?.locations && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {booking.packageId.locations.map((location, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            {location}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Travel Information */}
                    <div className="card bg-white">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Travel Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                                <p className="text-lg font-medium text-gray-900">{formatDate(booking.travelDate)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Travelers</label>
                                <p className="text-lg font-medium text-gray-900">{booking.travelers}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(booking.totalAmount)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                                <p className="text-lg font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Traveler Details */}
                    {booking.travelerDetails && booking.travelerDetails.length > 0 && (
                        <div className="card bg-white">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Traveler Details</h2>
                            
                            <div className="space-y-4">
                                {booking.travelerDetails.map((traveler, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                        <h3 className="font-medium text-gray-800 mb-2">
                                            Traveler {index + 1}
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span className="ml-2 text-gray-900">{traveler.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Age:</span>
                                                <span className="ml-2 text-gray-900">{traveler.age}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Gender:</span>
                                                <span className="ml-2 text-gray-900 capitalize">{traveler.gender}</span>
                                            </div>
                                            {traveler.phone && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Phone:</span>
                                                    <span className="ml-2 text-gray-900">{traveler.phone}</span>
                                                </div>
                                            )}
                                            {traveler.email && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Email:</span>
                                                    <span className="ml-2 text-gray-900">{traveler.email}</span>
                                                </div>
                                            )}
                                            {traveler.idType && (
                                                <div>
                                                    <span className="font-medium text-gray-700">ID Type:</span>
                                                    <span className="ml-2 text-gray-900 capitalize">{traveler.idType.replace('_', ' ')}</span>
                                                </div>
                                            )}
                                            {traveler.idNumber && (
                                                <div>
                                                    <span className="font-medium text-gray-700">ID Number:</span>
                                                    <span className="ml-2 text-gray-900">{traveler.idNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Details */}
                    {booking.contactDetails && (
                        <div className="card bg-white">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Primary Contact */}
                                {booking.contactDetails.primaryContact && (
                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-2">Primary Contact</h3>
                                        <div className="space-y-1 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.primaryContact.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Phone:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.primaryContact.phone}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.primaryContact.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Emergency Contact */}
                                {booking.contactDetails.emergencyContact && booking.contactDetails.emergencyContact.name && (
                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-2">Emergency Contact</h3>
                                        <div className="space-y-1 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.emergencyContact.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Phone:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.emergencyContact.phone}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Relation:</span>
                                                <span className="ml-2 text-gray-900">{booking.contactDetails.emergencyContact.relation}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Special Requests */}
                    {booking.specialRequests && (
                        <div className="card bg-white">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Requests</h2>
                            <p className="text-gray-700">{booking.specialRequests}</p>
                        </div>
                    )}

                    {/* Payment Details */}
                    {booking.paymentDetails && (
                        <div className="card bg-white">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {booking.paymentDetails.paymentMethod && (
                                    <div>
                                        <span className="font-medium text-gray-700">Payment Method:</span>
                                        <span className="ml-2 text-gray-900 capitalize">
                                            {booking.paymentDetails.paymentMethod.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                                {booking.paymentDetails.transactionId && (
                                    <div>
                                        <span className="font-medium text-gray-700">Transaction ID:</span>
                                        <span className="ml-2 text-gray-900">{booking.paymentDetails.transactionId}</span>
                                    </div>
                                )}
                                {booking.paymentDetails.paymentGateway && (
                                    <div>
                                        <span className="font-medium text-gray-700">Payment Gateway:</span>
                                        <span className="ml-2 text-gray-900 capitalize">{booking.paymentDetails.paymentGateway}</span>
                                    </div>
                                )}
                                {booking.paymentDetails.paymentDate && (
                                    <div>
                                        <span className="font-medium text-gray-700">Payment Date:</span>
                                        <span className="ml-2 text-gray-900">{formatDateTime(booking.paymentDetails.paymentDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cancellation Details */}
                    {booking.cancellationDetails && booking.cancellationDetails.cancelledAt && (
                        <div className="card bg-red-50 border border-red-200">
                            <h2 className="text-xl font-semibold text-red-800 mb-4">Cancellation Details</h2>
                            
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-red-700">Cancelled On:</span>
                                    <span className="ml-2 text-red-900">{formatDateTime(booking.cancellationDetails.cancelledAt)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-red-700">Reason:</span>
                                    <span className="ml-2 text-red-900">{booking.cancellationDetails.cancellationReason}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-red-700">Refund Amount:</span>
                                    <span className="ml-2 text-red-900">{formatCurrency(booking.cancellationDetails.refundAmount || 0)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-red-700">Refund Status:</span>
                                    <span className="ml-2 text-red-900 capitalize">{booking.cancellationDetails.refundStatus}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card bg-white">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        
                        <div className="space-y-3">
                            <Link 
                                to="/my-bookings"
                                className="w-full btn-secondary text-center"
                            >
                                Back to My Bookings
                            </Link>
                            
                            {booking.paymentStatus === 'pending' && booking.bookingStatus === 'pending' && (
                                <Link
                                    to={`/payment/${booking._id}`}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-center"
                                >
                                    Complete Payment
                                </Link>
                            )}
                            
                            {booking.bookingStatus === 'pending' && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            )}
                            
                            <button
                                onClick={() => window.print()}
                                className="w-full btn-secondary"
                            >
                                Print Details
                            </button>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    {booking.bookingStatus === 'pending' && (
                        <div className="card bg-yellow-50 border border-yellow-200">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Cancellation Policy</h3>
                            
                            <div className="space-y-2 text-sm text-yellow-700">
                                <p><strong>Policy:</strong> {refundInfo.policy}</p>
                                <p><strong>Days until travel:</strong> {refundInfo.daysDifference} days</p>
                                <p><strong>Refund amount:</strong> {formatCurrency(refundInfo.refundAmount)} ({refundInfo.refundPercentage}%)</p>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="card bg-blue-50 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
                        
                        <div className="space-y-2 text-sm text-blue-700">
                            <p>For any queries regarding your booking, please contact our support team.</p>
                            
                            <div className="space-y-1">
                                <p><strong>Phone:</strong> +91-1234567890</p>
                                <p><strong>Email:</strong> support@ghumakkadyatri.com</p>
                                <p><strong>Hours:</strong> 9 AM - 9 PM (All days)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Booking Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Cancel Booking
                        </h3>
                        
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                <strong>Refund Policy:</strong> {refundInfo.policy}
                            </p>
                            <p className="text-sm text-yellow-800">
                                <strong>Refund Amount:</strong> {formatCurrency(refundInfo.refundAmount)}
                            </p>
                        </div>
                        
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
                                onClick={() => setShowCancelModal(false)}
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

export default BookingDetails;