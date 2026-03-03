const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { Booking } = require('../models/Booking');
const helper = require('../functions/helper');
require('dotenv').config();

// Create a Razorpay order for a booking
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = await helper.getUserIdFromToken(req);

        const booking = await Booking.findOne({ _id: bookingId, userId });
        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        if (booking.paymentStatus === 'success') {
            return res.status(400).json({
                status: 'error',
                message: 'Payment has already been completed for this booking'
            });
        }

        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot pay for a cancelled booking'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(booking.totalAmount * 100), // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `booking_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: userId,
                packageId: booking.packageId.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        // Save Razorpay order ID to booking
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.status(200).json({
            status: 'success',
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                bookingId: booking._id,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while creating payment order'
        });
    }
};

// Verify Razorpay payment and update booking
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        const userId = await helper.getUserIdFromToken(req);

        // Verify the payment signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            // Mark payment as failed
            await Booking.findOneAndUpdate(
                { _id: bookingId, userId },
                {
                    paymentStatus: 'failed',
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature
                }
            );

            return res.status(400).json({
                status: 'error',
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Payment is verified — update booking
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, userId },
            {
                paymentStatus: 'success',
                bookingStatus: 'confirmed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paymentDetails: {
                    transactionId: razorpay_payment_id,
                    paymentDate: new Date(),
                    paymentGateway: 'razorpay'
                }
            },
            { new: true }
        ).populate('packageId', 'title description price locations duration image_url')
         .populate('userId', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Payment verified successfully',
            data: booking
        });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while verifying payment'
        });
    }
};

// Handle payment failure
exports.paymentFailed = async (req, res) => {
    try {
        const { bookingId, razorpay_order_id, razorpay_payment_id } = req.body;
        const userId = await helper.getUserIdFromToken(req);

        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, userId },
            {
                paymentStatus: 'failed',
                razorpayPaymentId: razorpay_payment_id || null,
                paymentDetails: {
                    transactionId: razorpay_payment_id || null,
                    paymentDate: new Date(),
                    paymentGateway: 'razorpay'
                }
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Payment failure recorded',
            data: booking
        });

    } catch (error) {
        console.error('Payment Failed Handler Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while handling payment failure'
        });
    }
};

// Get Razorpay Key ID (public key for frontend)
exports.getRazorpayKey = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            data: {
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Get Razorpay Key Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching payment key'
        });
    }
};
