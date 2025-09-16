import { apiRequest } from './api';

class BookingService {
    // USER BOOKING APIS
    
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking details
     * @returns {Promise} API response
     */
    async createBooking(bookingData) {
        try {
            const response = await apiRequest('POST', '/api/booking/create', bookingData);
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create booking');
        }
    }

    /**
     * Get current user's bookings with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise} API response
     */
    async getUserBookings(page = 1, limit = 10) {
        try {
            const response = await apiRequest('POST', '/api/booking/myBookings', {
                page,
                limit
            });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }

    /**
     * Get a specific booking by ID
     * @param {string} bookingId - Booking ID
     * @returns {Promise} API response
     */
    async getBookingById(bookingId) {
        try {
            const response = await apiRequest('POST', '/api/booking/getBooking', {
                bookingId
            });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
        }
    }

    /**
     * Update payment status for a booking
     * @param {string} bookingId - Booking ID
     * @param {string} paymentStatus - Payment status (success/failed/pending)
     * @param {Object} paymentDetails - Payment details object
     * @returns {Promise} API response
     */
    async updatePaymentStatus(bookingId, paymentStatus, paymentDetails = {}) {
        try {
            const response = await apiRequest('POST', '/api/booking/updatePayment', {
                bookingId,
                paymentStatus,
                paymentDetails
            });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update payment status');
        }
    }

    /**
     * Cancel a booking
     * @param {string} bookingId - Booking ID
     * @param {string} cancellationReason - Reason for cancellation
     * @returns {Promise} API response
     */
    async cancelBooking(bookingId, cancellationReason) {
        try {
            const response = await apiRequest('POST', '/api/booking/cancelBooking', {
                bookingId,
                cancellationReason
            });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to cancel booking');
        }
    }

    // ADMIN BOOKING APIS

    /**
     * Get all bookings (Admin only)
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @param {Object} filters - Filter options
     * @returns {Promise} API response
     */
    async getAllBookings(page = 1, limit = 10, filters = {}) {
        try {
            const payload = {
                page,
                limit,
                ...filters
            };
            const response = await apiRequest('POST', '/api/booking/admin/allBookings', payload);
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch all bookings');
        }
    }

    /**
     * Get booking statistics (Admin only)
     * @returns {Promise} API response
     */
    async getBookingStats() {
        try {
            const response = await apiRequest('POST', '/api/booking/admin/stats', {});
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch booking statistics');
        }
    }

    // UTILITY METHODS

    /**
     * Calculate refund amount based on cancellation policy
     * @param {number} totalAmount - Total booking amount
     * @param {string} travelDate - Travel date
     * @returns {Object} Refund calculation
     */
    calculateRefundAmount(totalAmount, travelDate) {
        const daysDifference = Math.ceil((new Date(travelDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        let refundPercentage = 0;
        let refundAmount = 0;
        
        if (daysDifference > 15) {
            refundPercentage = 75;
        } else if (daysDifference > 7) {
            refundPercentage = 50;
        } else if (daysDifference > 3) {
            refundPercentage = 25;
        }
        
        refundAmount = (totalAmount * refundPercentage) / 100;
        
        return {
            refundPercentage,
            refundAmount,
            daysDifference,
            policy: this.getRefundPolicy(daysDifference)
        };
    }

    /**
     * Get refund policy text
     * @param {number} daysDifference - Days between now and travel date
     * @returns {string} Policy text
     */
    getRefundPolicy(daysDifference) {
        if (daysDifference > 15) {
            return "75% refund - More than 15 days before travel";
        } else if (daysDifference > 7) {
            return "50% refund - 8-15 days before travel";
        } else if (daysDifference > 3) {
            return "25% refund - 4-7 days before travel";
        } else {
            return "No refund - Less than 3 days before travel";
        }
    }

    /**
     * Format booking status for display
     * @param {string} status - Booking status
     * @returns {Object} Formatted status with color and text
     */
    formatBookingStatus(status) {
        const statusMap = {
            'pending': { text: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'confirmed': { text: 'Confirmed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            'cancelled': { text: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
        };
        
        return statusMap[status] || { text: status, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    /**
     * Format payment status for display
     * @param {string} status - Payment status
     * @returns {Object} Formatted status with color and text
     */
    formatPaymentStatus(status) {
        const statusMap = {
            'pending': { text: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'success': { text: 'Paid', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            'failed': { text: 'Failed', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
        };
        
        return statusMap[status] || { text: status, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    /**
     * Validate booking form data
     * @param {Object} bookingData - Booking form data
     * @returns {Object} Validation result
     */
    validateBookingData(bookingData) {
        const errors = {};
        
        if (!bookingData.packageId) {
            errors.packageId = 'Package selection is required';
        }
        
        if (!bookingData.travelDate) {
            errors.travelDate = 'Travel date is required';
        } else if (new Date(bookingData.travelDate) <= new Date()) {
            errors.travelDate = 'Travel date must be in the future';
        }
        
        if (!bookingData.travelers || bookingData.travelers < 1) {
            errors.travelers = 'At least 1 traveler is required';
        }
        
        if (bookingData.travelerDetails && bookingData.travelerDetails.length > 0) {
            bookingData.travelerDetails.forEach((traveler, index) => {
                if (!traveler.name) {
                    errors[`traveler_${index}_name`] = `Traveler ${index + 1} name is required`;
                }
                if (!traveler.age || traveler.age < 1) {
                    errors[`traveler_${index}_age`] = `Traveler ${index + 1} age is required`;
                }
                if (!traveler.gender) {
                    errors[`traveler_${index}_gender`] = `Traveler ${index + 1} gender is required`;
                }
            });
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// Export singleton instance
const bookingService = new BookingService();
export default bookingService;

// Named exports for specific functions
export const {
    createBooking,
    getUserBookings,
    getBookingById,
    updatePaymentStatus,
    cancelBooking,
    getAllBookings,
    getBookingStats,
    calculateRefundAmount,
    formatBookingStatus,
    formatPaymentStatus,
    validateBookingData
} = bookingService;