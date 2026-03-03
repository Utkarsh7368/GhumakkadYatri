const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { authenticateToken } = require('../middleware/validateToken');

// All payment routes require authentication
router.post('/createOrder', authenticateToken, paymentController.createOrder);
router.post('/verifyPayment', authenticateToken, paymentController.verifyPayment);
router.post('/paymentFailed', authenticateToken, paymentController.paymentFailed);
router.get('/getRazorpayKey', authenticateToken, paymentController.getRazorpayKey);

module.exports = router;
