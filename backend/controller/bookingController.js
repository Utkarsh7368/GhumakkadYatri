const express = require('express');
const {Package, PackageDetail} = require('../models/Package');
const {Booking} = require('../models/Booking');
const helper = require('../functions/helper');
const { User, UserLoginHistory } = require('../models/User');
require('dotenv').config();

// Create a new booking
exports.addBooking = async (req, res) => {
    const { 
        packageId, 
        travelDate, 
        travelers, 
        travelerDetails, 
        contactDetails, 
        specialRequests
    } = req.body;

    try {
        const userId = await helper.getUserIdFromToken(req);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Package not found' 
            });
        }

        // Get package details for pricing calculation
        const packageDetails = await PackageDetail.findOne({ packageId });
        let totalAmount = 0;

        if (packageDetails && packageDetails.details && packageDetails.details.pricing) {
            const pricing = packageDetails.details.pricing;
            // Calculate based on adult/child pricing if available
            totalAmount = travelers * (pricing.adult_price || package.price);
        } else {
            // Fallback to package base price
            totalAmount = travelers * package.price;
        }

        const booking = new Booking({
            userId,
            packageId,
            travelDate: new Date(travelDate),
            travelers,
            totalAmount,
            travelerDetails: travelerDetails || [],
            contactDetails: contactDetails || {
                primaryContact: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone || ''
                }
            },
            specialRequests: specialRequests || '',
            paymentStatus: 'pending',
            bookingStatus: 'pending'
        });

        await booking.save();

        // Populate the booking with package and user details for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('packageId', 'title description price locations duration image_url')
            .populate('userId', 'name email phone');

        res.status(201).json({ 
            status: 'success',
            message: 'Booking created successfully', 
            data: populatedBooking 
        });

    } catch (error) {
        console.error('Add Booking Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while creating booking' 
        });
    }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        const userId = await helper.getUserIdFromToken(req);
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find({ userId })
            .populate('packageId', 'title description price locations duration image_url')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBookings = await Booking.countDocuments({ userId });

        res.status(200).json({
            status: 'success',
            data: bookings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBookings / limit),
                totalBookings,
                hasNext: page < Math.ceil(totalBookings / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get User Bookings Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while fetching bookings' 
        });
    }
};

// Get a specific booking
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = await helper.getUserIdFromToken(req);

        const booking = await Booking.findOne({ _id: bookingId, userId })
            .populate('packageId', 'title description price locations duration image_url')
            .populate('userId', 'name email phone');

        if (!booking) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Booking not found' 
            });
        }

        res.status(200).json({
            status: 'success',
            data: booking
        });

    } catch (error) {
        console.error('Get Booking Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while fetching booking' 
        });
    }
};

// Update booking payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { bookingId, paymentStatus, paymentDetails } = req.body;
        const userId = await helper.getUserIdFromToken(req);

        const booking = await Booking.findOne({ _id: bookingId, userId });
        if (!booking) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Booking not found' 
            });
        }

        booking.paymentStatus = paymentStatus;
        if (paymentDetails) {
            booking.paymentDetails = {
                ...booking.paymentDetails,
                ...paymentDetails,
                paymentDate: new Date()
            };
        }

        // Update booking status based on payment
        if (paymentStatus === 'success') {
            booking.bookingStatus = 'confirmed';
        }

        await booking.save();

        res.status(200).json({
            status: 'success',
            message: 'Payment status updated successfully',
            data: booking
        });

    } catch (error) {
        console.error('Update Payment Status Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while updating payment status' 
        });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId, cancellationReason } = req.body;
        const userId = await helper.getUserIdFromToken(req);

        const booking = await Booking.findOne({ _id: bookingId, userId });
        if (!booking) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Booking not found' 
            });
        }

        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({ 
                status: 'error',
                message: 'Booking is already cancelled' 
            });
        }

        // Prevent cancellation after travel date has passed
        if (new Date(booking.travelDate) < new Date(new Date().toDateString())) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Cannot cancel booking — travel date has already passed' 
            });
        }

        // Calculate refund amount (implement your refund policy)
        let refundAmount = 0;
        const daysDifference = Math.ceil((new Date(booking.travelDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 15) {
            refundAmount = booking.totalAmount * 0.75; // 75% refund
        } else if (daysDifference > 7) {
            refundAmount = booking.totalAmount * 0.50; // 50% refund
        } else if (daysDifference > 3) {
            refundAmount = booking.totalAmount * 0.25; // 25% refund
        }
        // Less than 3 days: no refund

        // Calculate estimated refund date (5-7 business days from now)
        const now = new Date();
        const estimatedRefundDate = new Date(now);
        let businessDaysAdded = 0;
        while (businessDaysAdded < 7) {
            estimatedRefundDate.setDate(estimatedRefundDate.getDate() + 1);
            const day = estimatedRefundDate.getDay();
            if (day !== 0 && day !== 6) { // Skip Sunday(0) and Saturday(6)
                businessDaysAdded++;
            }
        }

        booking.bookingStatus = 'cancelled';
        booking.cancellationDetails = {
            cancelledAt: now,
            cancellationReason,
            refundAmount,
            refundStatus: refundAmount > 0 ? 'pending' : 'processed',
            refundInitiatedAt: refundAmount > 0 ? now : undefined,
            estimatedRefundDate: refundAmount > 0 ? estimatedRefundDate : undefined,
            refundProcessedAt: refundAmount === 0 ? now : undefined,
            refundNote: refundAmount > 0
                ? `Refund of ₹${refundAmount.toFixed(2)} initiated. Expected by ${estimatedRefundDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.`
                : 'No refund applicable as per cancellation policy'
        };

        await booking.save();

        // Calculate hours remaining for the user-facing response
        const hoursUntilRefund = Math.ceil((estimatedRefundDate - now) / (1000 * 60 * 60));
        const daysUntilRefund = Math.ceil(hoursUntilRefund / 24);

        res.status(200).json({
            status: 'success',
            message: 'Booking cancelled successfully',
            data: {
                booking,
                refundAmount,
                estimatedRefundDate: refundAmount > 0 ? estimatedRefundDate : null,
                daysUntilRefund: refundAmount > 0 ? daysUntilRefund : 0,
                hoursUntilRefund: refundAmount > 0 ? hoursUntilRefund : 0,
                message: refundAmount > 0 
                    ? `Refund of ₹${refundAmount.toFixed(2)} has been initiated. It will be credited to your account within ${daysUntilRefund} days (~${hoursUntilRefund} hours).`
                    : 'No refund applicable as per cancellation policy'
            }
        });

    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while cancelling booking' 
        });
    }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.body.status;
        const paymentStatus = req.body.paymentStatus;

        let filter = {};
        if (status) filter.bookingStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const bookings = await Booking.find(filter)
            .populate('packageId', 'title description price locations duration')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBookings = await Booking.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: bookings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBookings / limit),
                totalBookings,
                hasNext: page < Math.ceil(totalBookings / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while fetching bookings' 
        });
    }
};

// Admin: Get booking statistics
exports.getBookingStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
        const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
        const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
        
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const monthlyStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    revenue: { 
                        $sum: { 
                            $cond: [{ $eq: ['$paymentStatus', 'success'] }, '$totalAmount', 0] 
                        } 
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overview: {
                    totalBookings,
                    confirmedBookings,
                    pendingBookings,
                    cancelledBookings,
                    totalRevenue: totalRevenue[0]?.total || 0
                },
                monthlyStats
            }
        });

    } catch (error) {
        console.error('Get Booking Stats Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Server error while fetching booking statistics' 
        });
    }
};

// Admin: Process refund for a cancelled booking
exports.processRefund = async (req, res) => {
    try {
        const { bookingId, refundNote } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        if (booking.bookingStatus !== 'cancelled') {
            return res.status(400).json({
                status: 'error',
                message: 'Only cancelled bookings can have refunds processed'
            });
        }

        if (!booking.cancellationDetails || booking.cancellationDetails.refundAmount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No refund amount applicable for this booking'
            });
        }

        if (booking.cancellationDetails.refundStatus === 'processed') {
            return res.status(400).json({
                status: 'error',
                message: 'Refund has already been processed for this booking'
            });
        }

        booking.cancellationDetails.refundStatus = 'processed';
        booking.cancellationDetails.refundProcessedAt = new Date();
        booking.cancellationDetails.refundNote = refundNote || `Refund of ₹${booking.cancellationDetails.refundAmount.toFixed(2)} has been credited to your account.`;

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('packageId', 'title description price locations duration image_url')
            .populate('userId', 'name email phone');

        res.status(200).json({
            status: 'success',
            message: 'Refund processed successfully',
            data: populatedBooking
        });

    } catch (error) {
        console.error('Process Refund Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while processing refund'
        });
    }
};