import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import Loader from '../components/Loader';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null | 'success' | 'failed'

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(bookingId);
            if (response.status === 'success') {
                setBooking(response.data);

                // If already paid, show success
                if (response.data.paymentStatus === 'success') {
                    setPaymentStatus('success');
                }
            }
        } catch (error) {
            toast.error('Failed to load booking details');
            console.error('Fetch booking error:', error);
            setTimeout(() => navigate('/my-bookings'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // Step 1: Create Razorpay order
            const orderResponse = await paymentService.createOrder(bookingId);
            if (orderResponse.status !== 'success') {
                throw new Error('Failed to create payment order');
            }

            const orderData = orderResponse.data;

            // Step 2: Open Razorpay checkout
            const result = await paymentService.initiatePayment(
                orderData,
                {
                    name: user?.name || booking?.contactDetails?.primaryContact?.name || '',
                    email: user?.email || booking?.contactDetails?.primaryContact?.email || '',
                    phone: booking?.contactDetails?.primaryContact?.phone || ''
                },
                {
                    packageTitle: booking?.packageId?.title || 'Travel Package'
                }
            );

            // Step 3: Payment verified successfully
            if (result.status === 'success') {
                setPaymentStatus('success');
                setBooking(result.data);
                toast.success('Payment successful! Your booking is confirmed.');
            }

        } catch (error) {
            console.error('Payment error:', error);
            if (error.message === 'Payment was cancelled by user') {
                toast.error('Payment cancelled');
            } else {
                setPaymentStatus('failed');
                toast.error(error.message || 'Payment failed. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loader />;
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">&#10060;</div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The booking you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <Link to="/my-bookings" className="btn-primary">
                        Go to My Bookings
                    </Link>
                </div>
            </div>
        );
    }

    // Payment Success View
    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your booking has been confirmed. You will receive a confirmation email shortly.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 text-left">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Booking Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Booking ID</span>
                                    <span className="font-mono text-gray-900 dark:text-white text-xs">
                                        {booking._id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Package</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {booking.packageId?.title || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Travel Date</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(booking.travelDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Travelers</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {booking.travelers}
                                    </span>
                                </div>
                                {booking.razorpayPaymentId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                                        <span className="font-mono text-gray-900 dark:text-white text-xs">
                                            {booking.razorpayPaymentId}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t dark:border-gray-600 pt-3 flex justify-between">
                                    <span className="font-semibold text-gray-800 dark:text-white">Amount Paid</span>
                                    <span className="font-bold text-green-600 text-lg">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to={`/booking-details/${booking._id}`}
                                className="btn-primary"
                            >
                                View Booking Details
                            </Link>
                            <Link
                                to="/my-bookings"
                                className="btn-secondary"
                            >
                                Go to My Bookings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Failed View
    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your payment could not be processed. No amount has been deducted.
                            Please try again.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6 text-left">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Package</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {booking.packageId?.title || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setPaymentStatus(null);
                                    handlePayment();
                                }}
                                className="btn-primary"
                            >
                                Retry Payment
                            </button>
                            <Link
                                to="/my-bookings"
                                className="btn-secondary"
                            >
                                Go to My Bookings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Payment Checkout View
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/my-bookings"
                        className="text-blue-600 hover:text-blue-700 flex items-center mb-4"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Bookings
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Complete Your Payment
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review your booking and proceed to secure payment
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Package Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Package Details
                            </h2>
                            <div className="flex gap-4">
                                {booking.packageId?.image_url && (
                                    <img
                                        src={booking.packageId.image_url}
                                        alt={booking.packageId.title}
                                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                                    />
                                )}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {booking.packageId?.title || 'Travel Package'}
                                    </h3>
                                    {booking.packageId?.locations && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {booking.packageId.locations.map((loc, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs"
                                                >
                                                    {loc}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {booking.packageId?.duration && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Duration: {booking.packageId.duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Travel Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Travel Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Travel Date</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(booking.travelDate)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Travelers</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {booking.travelers} {booking.travelers === 1 ? 'Person' : 'People'}
                                    </p>
                                </div>
                            </div>

                            {booking.travelerDetails && booking.travelerDetails.length > 0 && (
                                <div className="mt-4 border-t dark:border-gray-700 pt-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Traveler Names
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {booking.travelerDetails.map((t, i) => (
                                            <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                                                {t.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Info */}
                        {booking.contactDetails?.primaryContact && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Contact Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Name</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {booking.contactDetails.primaryContact.name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Email</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {booking.contactDetails.primaryContact.email}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Phone</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {booking.contactDetails.primaryContact.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                Price Summary
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Package Price x {booking.travelers}
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Taxes & Fees</span>
                                    <span>Included</span>
                                </div>
                                <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg">
                                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Pay {formatCurrency(booking.totalAmount)}
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Secured by Razorpay
                            </div>

                            {/* Cancellation Policy */}
                            <div className="mt-6 border-t dark:border-gray-700 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cancellation Policy
                                </h3>
                                <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <li>&#8226; &gt;15 days before travel: 75% refund</li>
                                    <li>&#8226; 8-15 days before travel: 50% refund</li>
                                    <li>&#8226; 4-7 days before travel: 25% refund</li>
                                    <li>&#8226; &lt;3 days before travel: No refund</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
