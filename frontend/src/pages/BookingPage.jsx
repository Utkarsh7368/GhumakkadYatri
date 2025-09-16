import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { packageService } from '../services';
import BookingForm from '../components/BookingForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const BookingPage = () => {
    const { packageId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get booking data from navigation state
    const bookingState = location.state;

    useEffect(() => {
        // Check authentication
        if (isAuthenticated === false) {
            navigate('/login', { 
                state: { 
                    returnTo: `/book/${packageId}`,
                    message: 'Please log in to book this package'
                }
            });
            return;
        }

        if (packageId) {
            fetchPackageData();
        }
    }, [packageId, isAuthenticated, navigate]);

    const fetchPackageData = async () => {
        try {
            setLoading(true);
            setError(null);

            // If we have package data from navigation state, use it
            if (bookingState?.packageData) {
                setPackageData(bookingState.packageData);
                setLoading(false);
                return;
            }

            // Otherwise fetch package data
            const response = await packageService.getPackageById(packageId);
            
            if (response?.data) {
                setPackageData(response.data);
            } else {
                setError('Package not found');
            }
        } catch (error) {
            console.error('Error fetching package:', error);
            setError('Failed to load package details');
            toast.error('Failed to load package details');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSuccess = (bookingData) => {
        toast.success('Booking submitted successfully!');
        // Navigate to user bookings page
        navigate('/my-bookings', {
            state: {
                message: 'Your booking has been submitted and is being processed.',
                bookingId: bookingData.bookingId
            }
        });
    };

    const handleBookingError = (error) => {
        console.error('Booking error:', error);
        toast.error(error.message || 'Failed to submit booking');
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
                    <p className="text-gray-600 mb-6">Please log in to book this package.</p>
                    <Link to="/login" className="btn-primary">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (error || !packageData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Package Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The requested package could not be found.'}</p>
                    <div className="space-x-4">
                        <button onClick={fetchPackageData} className="btn-secondary">
                            Try Again
                        </button>
                        <Link to="/packages" className="btn-primary">
                            Browse Packages
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <Link 
                                to={`/packages/${packageId}`}
                                className="text-gray-500 hover:text-gray-700 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                Back to Package
                            </Link>
                            <div className="text-gray-300">|</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Book Your Trip</h1>
                                <p className="text-sm text-gray-600">{packageData.title}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Booking as</div>
                                <div className="font-medium text-gray-900">{user?.name || user?.email}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Summary Bar */}
            <div className="bg-blue-50 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span className="text-sm font-medium text-blue-900">{packageData.destination}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm font-medium text-blue-900">
                                    {packageData.duration} {packageData.duration === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                            {bookingState?.selectedDate && (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span className="text-sm font-medium text-blue-900">
                                        {new Date(bookingState.selectedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-right">
                            <div className="text-sm text-blue-600">Starting from</div>
                            <div className="text-xl font-bold text-blue-900">
                                {packageData.pricing?.adult_price 
                                    ? `₹${packageData.pricing.adult_price.toLocaleString()}`
                                    : packageData.price 
                                        ? `₹${packageData.price.toLocaleString()}`
                                        : 'Contact for Price'
                                }
                            </div>
                            <div className="text-xs text-blue-600">per person</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <BookingForm 
                            packageData={packageData}
                            initialDate={bookingState?.selectedDate}
                            initialTravelers={bookingState?.travelers}
                            onSuccess={handleBookingSuccess}
                            onError={handleBookingError}
                        />
                    </div>

                    {/* Package Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Summary</h3>
                            
                            {/* Package Image */}
                            {packageData.image && (
                                <div className="mb-4">
                                    <img 
                                        src={packageData.image} 
                                        alt={packageData.title}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-800">{packageData.title}</h4>
                                    <p className="text-sm text-gray-600">{packageData.destination}</p>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium">
                                        {packageData.duration} {packageData.duration === 1 ? 'day' : 'days'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Package Type:</span>
                                    <span className="font-medium capitalize">{packageData.category || 'Adventure'}</span>
                                </div>
                                
                                {packageData.features && packageData.features.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-2">Includes:</div>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {packageData.features.slice(0, 4).map((feature, index) => (
                                                <li key={index} className="flex items-center">
                                                    <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                            {packageData.features.length > 4 && (
                                                <li className="text-blue-600 text-xs">
                                                    +{packageData.features.length - 4} more features
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="border-t pt-3 mt-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Price per person:</span>
                                        <span className="text-green-600">
                                            {packageData.pricing?.adult_price 
                                                ? `₹${packageData.pricing.adult_price.toLocaleString()}`
                                                : packageData.price 
                                                    ? `₹${packageData.price.toLocaleString()}`
                                                    : 'Contact for Price'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Need Help Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                            <p className="text-sm text-blue-700 mb-3">
                                Our travel experts are here to help you plan your perfect trip.
                            </p>
                            <Link 
                                to="/contact" 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Contact Support →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;