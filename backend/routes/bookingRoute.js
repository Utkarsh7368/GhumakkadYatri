const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');
const { authenticateToken } = require('../middleware/validateToken');

// User routes (require authentication)
router.post('/create', authenticateToken, bookingController.addBooking);
router.post('/myBookings', authenticateToken, bookingController.getUserBookings);
router.post('/getBooking', authenticateToken, bookingController.getBookingById);
router.post('/updatePayment', authenticateToken, bookingController.updatePaymentStatus);
router.post('/cancelBooking', authenticateToken, bookingController.cancelBooking);

// Admin routes (require admin role - you'll need to add admin middleware)
router.post('/admin/allBookings', authenticateToken, bookingController.getAllBookings);
router.post('/admin/stats', authenticateToken, bookingController.getBookingStats);

module.exports = router;