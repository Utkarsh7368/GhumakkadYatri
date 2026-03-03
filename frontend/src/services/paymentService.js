import { apiRequest } from './api';
import api from './api';

class PaymentService {
    /**
     * Load Razorpay checkout script dynamically
     * @returns {Promise<boolean>} 
     */
    loadRazorpayScript() {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    /**
     * Get Razorpay public key from backend
     * @returns {Promise<string>}
     */
    async getRazorpayKey() {
        try {
            const response = await api.get('/api/payment/getRazorpayKey');
            return response.data?.data?.keyId;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch payment key');
        }
    }

    /**
     * Create a Razorpay order for a booking
     * @param {string} bookingId 
     * @returns {Promise<Object>}
     */
    async createOrder(bookingId) {
        try {
            const response = await apiRequest('POST', '/api/payment/createOrder', { bookingId });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create payment order');
        }
    }

    /**
     * Verify payment after Razorpay checkout
     * @param {Object} paymentData
     * @returns {Promise<Object>}
     */
    async verifyPayment(paymentData) {
        try {
            const response = await apiRequest('POST', '/api/payment/verifyPayment', paymentData);
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Payment verification failed');
        }
    }

    /**
     * Report payment failure
     * @param {Object} failureData
     * @returns {Promise<Object>}
     */
    async reportPaymentFailure(failureData) {
        try {
            const response = await apiRequest('POST', '/api/payment/paymentFailed', failureData);
            return response;
        } catch (error) {
            console.error('Failed to report payment failure:', error);
        }
    }

    /**
     * Open Razorpay checkout and handle payment
     * @param {Object} orderData - Order data from createOrder API
     * @param {Object} userInfo - User details for prefill
     * @param {Object} bookingInfo - Booking details for display
     * @returns {Promise<Object>} Payment result
     */
    async initiatePayment(orderData, userInfo, bookingInfo) {
        const scriptLoaded = await this.loadRazorpayScript();
        if (!scriptLoaded) {
            throw new Error('Failed to load Razorpay. Please check your internet connection.');
        }

        return new Promise((resolve, reject) => {
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Ghumakkad Yatri',
                description: bookingInfo?.packageTitle 
                    ? `Booking for ${bookingInfo.packageTitle}` 
                    : 'Travel Booking Payment',
                image: '/logo.png',
                order_id: orderData.orderId,
                handler: async (response) => {
                    // Payment successful on Razorpay side — verify on server
                    try {
                        const verifyResult = await this.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: orderData.bookingId
                        });
                        resolve(verifyResult);
                    } catch (error) {
                        reject(error);
                    }
                },
                prefill: {
                    name: userInfo?.name || '',
                    email: userInfo?.email || '',
                    contact: userInfo?.phone || ''
                },
                notes: {
                    bookingId: orderData.bookingId
                },
                theme: {
                    color: '#2563EB' // Blue-600 matching the site theme
                },
                modal: {
                    ondismiss: () => {
                        reject(new Error('Payment was cancelled by user'));
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', async (response) => {
                // Report failure to backend
                await this.reportPaymentFailure({
                    bookingId: orderData.bookingId,
                    razorpay_order_id: orderData.orderId,
                    razorpay_payment_id: response.error?.metadata?.payment_id || null
                });
                reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
            });

            rzp.open();
        });
    }
}

const paymentService = new PaymentService();
export default paymentService;
