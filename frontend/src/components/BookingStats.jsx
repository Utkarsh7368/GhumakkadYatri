import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../services/bookingService';
import Loader from './Loader';

const BookingStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingStats();
    }, []);

    const fetchBookingStats = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingStats();
            
            if (response.status === 'success') {
                setStats(response.data);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch booking statistics');
            console.error('Fetch booking stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || `Month ${monthNumber}`;
    };

    const calculatePercentage = (value, total) => {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    };

    if (loading) {
        return <Loader />;
    }

    if (!stats) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="text-red-400 text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Statistics not available</h3>
                    <p className="text-gray-500 mb-6">Unable to load booking statistics.</p>
                    <button onClick={fetchBookingStats} className="btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { overview, monthlyStats } = stats;

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Booking Statistics</h1>
                    <p className="text-gray-600">Overview of all booking activities and revenue</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchBookingStats}
                        className="btn-secondary"
                    >
                        Refresh
                    </button>
                    <Link to="/admin/bookings" className="btn-primary">
                        View All Bookings
                    </Link>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900">{overview.totalBookings}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">All time bookings</p>
                    </div>
                </div>

                {/* Confirmed Bookings */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Confirmed</p>
                            <p className="text-3xl font-bold text-gray-900">{overview.confirmedBookings}</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">
                            {calculatePercentage(overview.confirmedBookings, overview.totalBookings)}% of total
                        </p>
                    </div>
                </div>

                {/* Pending Bookings */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-gray-900">{overview.pendingBookings}</p>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">
                            {calculatePercentage(overview.pendingBookings, overview.totalBookings)}% of total
                        </p>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-xs text-gray-500">From confirmed bookings</p>
                    </div>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Booking Status Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status Distribution</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                                <span className="text-sm font-medium text-gray-700">Confirmed</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{overview.confirmedBookings}</div>
                                <div className="text-xs text-gray-500">
                                    {calculatePercentage(overview.confirmedBookings, overview.totalBookings)}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${calculatePercentage(overview.confirmedBookings, overview.totalBookings)}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                                <span className="text-sm font-medium text-gray-700">Pending</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{overview.pendingBookings}</div>
                                <div className="text-xs text-gray-500">
                                    {calculatePercentage(overview.pendingBookings, overview.totalBookings)}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${calculatePercentage(overview.pendingBookings, overview.totalBookings)}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                                <span className="text-sm font-medium text-gray-700">Cancelled</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{overview.cancelledBookings}</div>
                                <div className="text-xs text-gray-500">
                                    {calculatePercentage(overview.cancelledBookings, overview.totalBookings)}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${calculatePercentage(overview.cancelledBookings, overview.totalBookings)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {calculatePercentage(overview.confirmedBookings, overview.totalBookings)}%
                                    </p>
                                </div>
                                <div className="text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">Bookings confirmed vs total</p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Avg. Booking Value</p>
                                    <p className="text-xl font-bold text-green-900">
                                        {overview.confirmedBookings > 0 
                                            ? formatCurrency(overview.totalRevenue / overview.confirmedBookings)
                                            : formatCurrency(0)
                                        }
                                    </p>
                                </div>
                                <div className="text-green-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-green-700 mt-1">Revenue per confirmed booking</p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Pending Actions</p>
                                    <p className="text-2xl font-bold text-yellow-900">{overview.pendingBookings}</p>
                                </div>
                                <div className="text-yellow-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">Bookings requiring attention</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Statistics */}
            {monthlyStats && monthlyStats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Performance (Current Year)</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bookings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg. Booking Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Growth
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyStats.map((month, index) => {
                                    const prevMonth = index > 0 ? monthlyStats[index - 1] : null;
                                    const growth = prevMonth 
                                        ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1)
                                        : null;
                                    const avgBookingValue = month.count > 0 ? month.revenue / month.count : 0;
                                    
                                    return (
                                        <tr key={month._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {getMonthName(month._id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {month.count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                {formatCurrency(month.revenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(avgBookingValue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {growth !== null ? (
                                                    <span className={`${
                                                        parseFloat(growth) >= 0 
                                                            ? 'text-green-600 bg-green-100' 
                                                            : 'text-red-600 bg-red-100'
                                                    } px-2 py-1 rounded-full text-xs font-medium`}>
                                                        {growth > 0 ? '+' : ''}{growth}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {monthlyStats.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No monthly data available for current year
                        </div>
                    )}
                </div>
            )}

            {/* Action Items */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Action Required</h3>
                
                <div className="space-y-3">
                    {overview.pendingBookings > 0 && (
                        <div className="flex items-center justify-between bg-white rounded p-3">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {overview.pendingBookings} pending bookings need attention
                                    </p>
                                    <p className="text-xs text-gray-600">Follow up on payment and confirmation status</p>
                                </div>
                            </div>
                            <Link 
                                to="/admin/bookings?status=pending" 
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                                View →
                            </Link>
                        </div>
                    )}
                    
                    {overview.cancelledBookings > 0 && (
                        <div className="flex items-center justify-between bg-white rounded p-3">
                            <div className="flex items-center">
                                <div className="bg-red-100 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {overview.cancelledBookings} cancelled bookings
                                    </p>
                                    <p className="text-xs text-gray-600">Review cancellation reasons and refund status</p>
                                </div>
                            </div>
                            <Link 
                                to="/admin/bookings?status=cancelled" 
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Review →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingStats;